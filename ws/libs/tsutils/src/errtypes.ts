import { JsonCode, JsonValue } from './json'

export type ResultCode = JsonCode

export interface Coded {
    readonly code: ResultCode
    readonly info: JsonValue
}

export interface ErrorWithCode
    extends Coded, Error
{
}
