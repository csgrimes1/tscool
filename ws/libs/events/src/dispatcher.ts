import { gen2array, JsonCode, Result } from '@tscool/tsutils'
import { trySync } from '@tscool/tsutils'
import { asyncSerialProcess } from '@tscool/asyncserial'
import {
    EventCallback, EventCallbackAsynchronous, EventCallbackSynchronous,
    EventDispatchResult, Event,
    EventResult,
    Synchronicity,
    EventDispatchStrategyCallback,
} from './types'

type _EventListeners<T, R> = Map<JsonCode, EventCallback<T, R>>

export class EventDispatcher<T, R> {
    constructor(readonly map: _EventListeners<T, R> = new Map<JsonCode, EventCallback<T, R>>()) {
    }

    register(code: JsonCode, callback: EventCallback<T, R>) {
        return this.map.set(code, callback)
    }
    registerSync(code: JsonCode, callback: (e: Event<T>) => R) {
        const synchronicity: Synchronicity = 'sync'
        const ecb = Object.assign(
            callback.bind(null),
            { synchronicity }
        )
        return this.register(code, ecb)
    }

    remove(code: JsonCode) {
        return this.map.delete(code)
    }

    emitSync(data: T): EventDispatchResult<R> {
        const returnValues = Array.from(this.map.entries())
            .filter(([_id, callback]) => callback.synchronicity === 'sync')
            .map(([id, callback]) => [id, callback] as [JsonCode, EventCallbackSynchronous<T, R>])
            .map(([id, callback]): [JsonCode, R] => [id, callback({ data, id })])
            .map(([id, returnValue]) => ({
                id, returnValue, ok: true
            }))
        return {
            returnValues,
            ok: true,
        }
    }

    emitSyncSafe(data: T): EventDispatchResult<R> {
        const returnValues = Array.from(this.map.entries())
            .filter(([_id, callback]) => callback.synchronicity === 'sync')
            .map(([id, callback]) => [id, callback] as [JsonCode, EventCallbackSynchronous<T, R>])
            .map(([id, callback]) => {
                const res = trySync(() => callback({ id, data }))
                return res.ok
                    ? { id, returnValue: res.value, ok: true }
                    : { id, error: res.error, ok: false }
            })
        return {
            returnValues,
            ok: true,
        }
    }

    async emitParallel(data: T): Promise<EventDispatchResult<R>> {
        const r = Array.from(this.map.entries())
            .map(([id, callback]) => _wrapCallback(id, callback, false))
            .map(callback => callback(data))
        const returnValues = await Promise.all(r)
        return {
            returnValues,
            ok: true,
        }
    }

    async emitParallelSafe(data: T): Promise<EventDispatchResult<R>> {
        const r = Array.from(this.map.entries())
            .map(([id, callback]) => _wrapCallback(id, callback, true))
            .map(callback => callback(data))
        const returnValues = (await Promise.allSettled(r))
            .map(x => x.status === 'fulfilled'
                ? x.value
                : x.reason
            )
        return {
            returnValues,
            ok: returnValues
                .filter(item => item.ok)
                .length > 0,
        }
    }

    async emitSerialSafe(
        data: T, chunkSize = 1,
        completionCallback?: <TSuccess, TError>(_chunk: Result<TSuccess, TError>[]) => Promise<boolean>
    ): Promise<EventDispatchResult<R>> {
        const ids = Array.from(this.map.keys())
        const tasks = Array.from(this.map.entries())
            .map(([id, cb]) => () => (cb as EventCallbackAsynchronous<T, R>)({ id, data }))
        const chunks = await asyncSerialProcess<R>(tasks, chunkSize, completionCallback)
        const returnValues = (await gen2array(chunks))
            .flat()
            .map((res, index): EventResult<R> => ({
                ok: res.ok,
                id: ids[index],
                error: res.error,
                returnValue: res.value,
            }))
        return {
            returnValues,
            ok: returnValues
                .filter(item => item.ok)
                .length > 0,
        }
    }
}

function _wrapCallback<T, R>(id: JsonCode, callback: EventCallback<T, R>, throwX: boolean) {
    return (data: T) => {
        const cb = callback.synchronicity === 'async'
            ? callback as EventCallbackAsynchronous<T, R>
            : Object.assign(
                async function (arg: Event<T>) {
                    return callback(arg)
                },
                {
                    synchronicity: 'async'
                }
            )
        return cb({ data, id })
            .then(result => ({
                id,
                result,
                ok: true,
            }))
            .catch((error: Error) => ({
                id,
                error,
                ok: false
            }))
            .then(result => {
                if ((result as any).error && throwX) {
                    return Promise.reject(result)
                }
                return result
            })
    }
}

export function defaultErrorHandler(e: Error, syncro: Synchronicity) {
    console.error({ syncro }, e)
}


export function createSafeDispatcher<T, R>(
    dispatcher: EventDispatcher<T, R>,
    callback: (disp: EventDispatcher<T, R>, data: T) => Promise<EventDispatchResult<R>>,
    errorHandler: (e: Error, syncro: Synchronicity) => void = defaultErrorHandler
): EventDispatchStrategyCallback<T, R> {
    return Object.assign(
        function (data: T) {
            try {
                callback(dispatcher, data)
                    .catch(err => errorHandler(err, 'async'))
            } catch (err) {
                errorHandler(err as Error, 'sync')
                return {
                    id: null,
                    error: err as Error,
                    ok: false,
                    returnValues: []
                }
            }
            return {
                returnValues: [],
                id: null,
                ok: true
            }
        },
        {
            dispatcher,
        },
    )
}
