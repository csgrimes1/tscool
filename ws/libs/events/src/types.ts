import { JsonCode } from '@tscool/tsutils'
import { EventDispatcher } from 'ws/libs/events/src/dispatcher'

export interface Event<T> {
    readonly id: JsonCode
    readonly data: T
}

export type Synchronicity = 'sync' | 'async'

export interface BaseEventCallback {
    readonly synchronicity: Synchronicity
}

export interface EventCallbackSynchronous<T, R> extends BaseEventCallback {
    (e: Event<T>): R
    readonly synchronicity: 'sync'
}
export interface EventCallbackAsynchronous<T, R> extends BaseEventCallback {
    (e: Event<T>): Promise<R>
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

export interface EventDispatchResult<R>
    extends _EventResult {
    readonly returnValues: ReadonlyArray<EventResult<R>>
}

export type EventDispatchStrategyCallback<T, R> = {
    (data: T): EventDispatchResult<R>
    readonly dispatcher: EventDispatcher<T, R>
}
