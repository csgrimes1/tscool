import { parseStack } from './stackparse'

export function getCurrentStack(limit?: number): string {
    const inobj = { stack: "" } satisfies { stack: string }

    const oldLimit = Error.stackTraceLimit
    if (limit) {
        Error.stackTraceLimit = limit
    }
    Error.captureStackTrace(inobj)
    if (limit) {
        Error.stackTraceLimit = oldLimit
    }
    return inobj.stack
}

export function getCurrentStackFrames(limit?: number) {
    const stack = getCurrentStack(limit)
    return parseStack(stack)
        .slice(2)
}
