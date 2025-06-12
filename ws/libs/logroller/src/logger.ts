import { JsonCode, MILLISECONDS, Cache, JsonValue, pruneUndef, Expiring } from '@tscool/tsutils'
import { EventDispatchStrategyCallback } from '@tscool/events'
import { ILogger, LogLevelIds, LogLevelNames, LogRecord, LogRecordEnvelope, verbosity } from './types'


export class Logger implements ILogger {
    private _cache = new Cache<JsonCode, MILLISECONDS>()
    constructor(readonly loglevel: LogLevelNames, 
        readonly dispatcher: EventDispatchStrategyCallback<LogRecordEnvelope, unknown>,
        readonly contextInfo: Record<string, JsonValue> = {}
    ) {        
    }

    get logLevelId(): LogLevelIds
    {
        return verbosity[this.loglevel]
    }

    coded(code: JsonCode, message?: string, info?: JsonValue): ILogger {
        return this.raw({code, message, info, level: this.logLevelId })
    }
    text(message: string, info?: JsonValue): ILogger {
        return this.raw({message, info, level: this.logLevelId})
    }

    raw(record: LogRecord): ILogger {
        const env: LogRecordEnvelope = {
            data: {
                ...pruneUndef(record as LogRecord & Record<string, unknown>),
                level: this.logLevelId,
                dt: new Date().toISOString(),
            },
            id: verbosity[this.loglevel],
            ...this.contextInfo,
        }
        this.dispatcher(env)
        return this
    }

    meteredLogger(code: JsonCode, period: MILLISECONDS=60000) {
        const now = Date.now()
        const val = this._cache.access(code, () => new Expiring(now, period))
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        // If it's new...
        if (val === now) {
            return {
                text(message: string, info?: JsonValue) {
                    self.coded(code, message, info)
                    return this
                }
            }
        }
        return undefined
    }
}
