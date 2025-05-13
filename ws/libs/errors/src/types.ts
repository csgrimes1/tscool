import { JsonValue, JsonCode, Coded } from '@tscool/tsutils'

export type ErrorCode = JsonCode

export interface StackFrame {
    readonly funcname: string
    readonly file: string
    readonly line: number
    readonly column: number
    toString(): string
}

export interface CodedError
    extends Coded
{
    readonly stackFrames: StackFrame[]
    readonly info: JsonValue
    readonly inner?: CodedError
}
