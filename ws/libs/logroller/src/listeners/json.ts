import { pruneUndef } from '@tscool/tsutils'
import { Event } from '@tscool/events'
import { LogRecord, LogRecordEnvelope, verbosity } from '../'

function _normalize(env: LogRecordEnvelope): LogRecord {
    const rec = env.data
    return {
        level: rec.level,
        ...pruneUndef({
            dt: rec.dt,
            source: rec.source,
            line: rec.line,
            pos: rec.pos,
            code: rec.code,
            message: rec.message,
            info: rec.info,
            id: env.id,
        })
    }
}

export function jsonListener(event: Event<LogRecordEnvelope>): unknown {
    const logrec = event.data
    const f = logrec.data.level === verbosity.error ? console.error : console.log
    f(JSON.stringify(_normalize(logrec)))
    return undefined
}
