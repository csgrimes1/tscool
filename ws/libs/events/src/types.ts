import { JsonCode } from '@tscool/tsutils'
import { EventDispatcher } from 'ws/libs/events/src/dispatcher'


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

export type EventDispatchStrategyCallback<T, R> = {
    (data: T): EventDispatchResult<R>
    readonly dispatcher: EventDispatcher<T, R>
}
