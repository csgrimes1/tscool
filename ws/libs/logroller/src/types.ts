import { SetRequired } from 'type-fest'
import { JsonCode, JsonValue } from '@tscool/tsutils'

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
export const severity: Record<LogLevelNames, LogLevelIds> = {
    off: 5,
    error: 4,
    warn: 3,
    info: 2,
    debug: 1,
    trace: 0,
}

export const LevelNumToName = new Map(Object.entries(verbosity)
    .map(([k, v]) => [v, k])
) as Map<LogLevelIds, LogLevelNames>

export const SeverityNumToName = new Map(Object.entries(severity)
    .map(([k, v]) => [v, k])
) as Map<LogLevelIds, LogLevelNames>

export type ISO8601STRING = string

export interface NakedLogRecord {
    readonly level?: LogLevelIds
    readonly message?: string
    readonly code?: JsonCode
    readonly info?: JsonValue
    readonly source?: string
    readonly line?: number
    readonly pos?: number
    readonly dt?: ISO8601STRING
}
export type LogRecord = SetRequired<NakedLogRecord, 'level' | 'dt'> & Record<string, JsonValue>

export interface ILogger {
    raw(record: LogRecord): ILogger
    coded(code: JsonCode, message?: string, info?: JsonValue): ILogger
    text(message: string, info?: JsonValue): ILogger
}

export type LoggingApi = Record<LogLevelNames, ILogger|undefined>
