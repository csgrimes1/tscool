import { JsonCode, Result } from '@tscool/tsutils'

export type Synchronicity = 'sync' | 'async'

export interface BaseEventCallback {
    readonly synchronicity: Synchronicity
}

export type RawSyncHandler<T, R> = (e: T, code: JsonCode) => R
export interface EventCallbackSynchronous<T, R> extends RawSyncHandler<T, R>, BaseEventCallback {
    
    readonly synchronicity: 'sync'
}
export type RawAsyncHandler<T, R> = (e: T, code: JsonCode) => Promise<R>
export interface EventCallbackAsynchronous<T, R> extends RawAsyncHandler<T, R>, BaseEventCallback {
    readonly synchronicity: 'async'
}
export type EventCallback<T, R> = EventCallbackSynchronous<T, R>
    | EventCallbackAsynchronous<T, R>



interface _EventResult {
    readonly ok: boolean
    readonly error?: Error
}

export interface EventResult<R> extends _EventResult {
    readonly id: JsonCode
    readonly returnValue?: R
}

export interface EventDispatchResult<R> {
    readonly returnValues: ReadonlyArray<EventResult<R>>
}

export interface SupportsEmit<T, R> {
        /**
     * Emits to only the synchronouse handlers.
     * @param data Event
     * @returns An object containing the return values from each listener. The method
     *  does not catch errors thrown by event handlers.
     */
    emitSync(data: T): EventDispatchResult<R>

    /**
     * Emits event only to synchronous handlers. All handlers will be called, and
     * any errors are contained in the returned object's returnValues field.
     * @param data Event
     * @returns An object containing the result or error from each handler.
     */
    emitSyncSafe(data: T): EventDispatchResult<R>
    emitParallel(data: T): Promise<EventDispatchResult<R>>
    emitParallelSafe(data: T): Promise<EventDispatchResult<R>>
    emitSerialSafe(
        data: T, chunkSize: number,
        completionCallback?: <TSuccess, TError>(_chunk: Result<TSuccess, TError>[]) => Promise<boolean>
    ): Promise<EventDispatchResult<R>>
}

export type EventDispatchStrategyCallback<T, R> = {
    (data: T): EventDispatchResult<R>
    readonly dispatcher: SupportsEmit<T, R>
}
