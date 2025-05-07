import { JsonCode, JsonValue } from '@tscool/tsutils'
import { Event } from '@tscool/events'

export const logLevelNames = ['trace', 'debug', 'info', 'warn', 'error', 'off'] as const
export const logLevelIds = [5, 4, 3, 2, 1, 0] as const

export type LogLevelNames = (typeof logLevelNames)[number]
export type LogLevelIds = (typeof logLevelIds)[number]

export const verbosity: Record<LogLevelNames, LogLevelIds> = {
    off: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
}

export const LevelNumToName = new Map(Object.entries(verbosity)
    .map(([k, v]) => [v, k])
) as Map<LogLevelIds, LogLevelNames>

export type ISO8601STRING = string

export interface LogRecord {
    readonly level: LogLevelIds
    readonly message?: string
    readonly code?: JsonCode
    readonly info?: JsonValue
    readonly source?: string
    readonly line?: number
    readonly pos?: number
    readonly dt?: ISO8601STRING
}

export interface LogRecordEnvelope extends Event<LogRecord> {
    readonly id: LogLevelIds
    readonly data: LogRecord
}

export interface ILogger {
    raw(record: LogRecord): ILogger
    coded(code: JsonCode, message?: string, info?: JsonValue): ILogger
    text(message: string, info?: JsonValue): ILogger
}

export type LoggingApi = Record<LogLevelNames, ILogger|undefined>
