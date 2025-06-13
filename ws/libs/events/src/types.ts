import { JsonCode, Result } from '@tscool/tsutils'

export type Synchronicity = 'sync' | 'async'

export interface BaseEventCallback {
    readonly synchronicity: Synchronicity
}

export interface RawSyncHandler<T, R> {
    (e: T, code: JsonCode): R
    readonly code?: JsonCode
}
export interface EventCallbackSynchronous<T, R> extends RawSyncHandler<T, R>, BaseEventCallback {
    readonly synchronicity: 'sync'
}
export interface RawAsyncHandler<T, R> {
    (e: T, code: JsonCode): Promise<R>
    readonly code?: JsonCode
}
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

export interface CallbackRegisterResult<T, R> {
    readonly proposedCode: JsonCode
    readonly usedCode: JsonCode
    readonly callback: EventCallback<T, R>
    readonly eventDispatcher: DispatcherApi<T, R>
}

export interface CallbackRemovalResult<T, R> {
    readonly code: JsonCode
    readonly eventDispatcher: DispatcherApi<T, R>
    readonly found: boolean
}

export interface DispatcherApi<T, R> {
    /**
     * General registration of an event handler.
     * @param callback Event handler.
     * @param code Code to uniquely identify the handler. The same handler can be used in association with
     *  multiple codes, responding differently to each code. If this parameter is undefined, a
     *  default code will be generated using an HMAC of the function's code. The code is used as key
     *  in the internal map.
     * @returns An object containing the proposed and used code, a pointer to the event handler,
     *  and the `this` object for chaining. The usedCode field must be saved when the code parameter
     *  is undefined to allow removing the event handler later.
     */
    register(callback: EventCallback<T, R>, code?: JsonCode): CallbackRegisterResult<T, R>

    /**
     * Wrapper for the register method.
     * @param callback Event handler as a naked function. This method tags the
     *  function with the synchronicity attribute as a convenience.
     * @param code See register method.
     * @returns See register method.
     */
    registerSync(callback: RawSyncHandler<T, R>, code?: JsonCode): CallbackRegisterResult<T, R>

    /**
     * Wrapper for the register method.
     * @param callback Event handler as a naked function. This method tags the
     *  function with the synchronicity attribute as a convenience.
     * @param code See register method.
     * @returns See register method.
     */
    registerAsync(callback: RawAsyncHandler<T, R>, code?: JsonCode): CallbackRegisterResult<T, R>

    /**
     * Attempts to remove an registered event handler.
     * @param code The key of the handler.
     */
    remove(code: JsonCode): CallbackRemovalResult<T, R>

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
    readonly dispatcher: DispatcherApi<T, R>
}
