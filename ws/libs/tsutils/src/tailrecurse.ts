import { ArrayAtLeastOneElement } from './array'

export type FuncArgs = ArrayAtLeastOneElement<unknown>

export interface RecursionContext<State, R> {
    recurse(arg: State): R
    callCount: number
}

const _doRecurse = Symbol.for('doRecurse');

type _ContinuationResult<State> = {
    readonly tag: symbol
    readonly state: State
}

function _castRecurse<S, R>(state: S): R {
    const cr: _ContinuationResult<S> = {
        tag: _doRecurse,
        state,
    }
    return cr as R
}

export type RecursionCallback<T, S, R> = (args: T, state: S, context: RecursionContext<S, R>) => R

export interface TailRecursionOptions {
    readonly maxCalls: number
}

export const defaultTailRecursionOptions: TailRecursionOptions = {
    maxCalls: 100,
}

export function tailRecurse<T, S, R>(args: T, initialState: S, callback: RecursionCallback<T, S, R>, options = defaultTailRecursionOptions): R {
    const recurse = _castRecurse<S, R>
    let currentState = initialState
    for(let i=1; i<=options.maxCalls; i++) {
        const result = callback(args, currentState, {
            callCount: i,
            recurse,
        })
        const continuationInfo = result as unknown as _ContinuationResult<S>
        const mustContinue = (continuationInfo?.tag) === _doRecurse
        if (!mustContinue) return result
        currentState = continuationInfo.state
    }
    throw new Error('STACK-OVERFLOW')
}
