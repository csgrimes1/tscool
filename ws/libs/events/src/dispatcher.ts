import { gen2array, hmac, JsonCode, Result } from '@tscool/tsutils'
import { trySync, pruneUndef } from '@tscool/tsutils'
import { asyncSerialProcess } from '@tscool/asyncserial'
import { err } from '@tscool/errors'
import {
    EventCallback, EventCallbackAsynchronous, EventCallbackSynchronous,
    EventDispatchResult,
    EventResult,
    Synchronicity,
    EventDispatchStrategyCallback,
    RawSyncHandler,
    RawAsyncHandler,
} from './types'

/** Map type used internally by EventDispatcher. */
export type EventListeners<T, R> = Map<JsonCode, EventCallback<T, R>>

function _keyFor(callback: Function, code?: JsonCode): JsonCode { // eslint-disable-line
    if (code === undefined) {
        return hmac('eventdispatcher', callback.toString())
    }
    return code as JsonCode
}

/** Manages a single event of a specific type signature. Supports multiple dispatch models
 *  in terms of synchronicity and parallelism.
 */
export class EventDispatcher<T, R> {
    constructor(readonly map: EventListeners<T, R> = new Map<JsonCode, EventCallback<T, R>>()) {
    }

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
    register(callback: EventCallback<T, R>, code?: JsonCode) {
        const usedCode = code ?? callback.code ?? _keyFor(callback, code)
        this.map.set(usedCode, callback)
        return {
            proposedCode: code,
            usedCode,
            callback,
            eventDispatcher: this,
        }
    }

    /**
     * Wrapper for the register method.
     * @param callback Event handler as a naked function. This method tags the
     *  function with the synchronicity attribute as a convenience.
     * @param code See register method.
     * @returns See register method.
     */
    registerSync(callback: RawSyncHandler<T, R>, code?: JsonCode) {
        const synchronicity: Synchronicity = 'sync'
        const ecb = Object.assign(
            callback.bind(null),
            {
                synchronicity,
                code: code ?? callback.code
            }
        )
        return this.register(ecb, code)
    }

    /**
     * Wrapper for the register method.
     * @param callback Event handler as a naked function. This method tags the
     *  function with the synchronicity attribute as a convenience.
     * @param code See register method.
     * @returns See register method.
     */
    registerAsync(callback: RawAsyncHandler<T, R>, code?: JsonCode) {
        const synchronicity: Synchronicity = 'async'
        const ecb = Object.assign(
            callback.bind(null),
            {
                synchronicity,
                code: code ?? callback.code
            }
        )
        return this.register(ecb, code)
    }

    /**
     * Attempts to remove an registered event handler.
     * @param code The key of the handler.
     */
    remove(code: JsonCode) {
        const found = this.map.delete(code)
        return {
            code,
            found,
            eventDispatcher: this,
        }
    }

    /**
     * Emits to only the synchronouse handlers.
     * @param data Event
     * @returns An object containing the return values from each listener. The method
     *  does not catch errors thrown by event handlers.
     */
    emitSync(data: T): EventDispatchResult<R> {
        const returnValues = Array.from(this.map.entries())
            .filter(([_id, callback]) => callback.synchronicity === 'sync')
            .map(([id, callback]) => [id, callback] as [JsonCode, EventCallbackSynchronous<T, R>])
            .map(([id, callback]): [JsonCode, R] => [id, callback(data, id)])
            .map(([id, returnValue]) => ({
                id, returnValue, ok: true
            }))
        return {
            returnValues,
        }
    }

    /**
     * Emits event only to synchronous handlers. All handlers will be called, and
     * any errors are contained in the returned object's returnValues field.
     * @param data Event
     * @returns An object containing the result or error from each handler.
     */
    emitSyncSafe(data: T): EventDispatchResult<R> {
        const returnValues = Array.from(this.map.entries())
            .filter(([_id, callback]) => callback.synchronicity === 'sync')
            .map(([id, callback]) => [id, callback] as [JsonCode, EventCallbackSynchronous<T, R>])
            .map(([id, callback]) => {
                const res = trySync(() => callback(data, id))
                return res.ok
                    ? { id, returnValue: res.value, ok: true }
                    : { id, error: res.error, ok: false }
            })
        return {
            returnValues,
        }
    }

    async emitParallel(data: T): Promise<EventDispatchResult<R>> {
        const r = Array.from(this.map.entries())
            .map(([id, callback]) => _wrapCallback(id, callback, false))
            .map(callback => callback(data))
        const returnValues = await Promise.all(r)
        const errors = returnValues.filter(x => !x.ok) as EventResult<R>[]
        if (errors.length > 0) {
            throw err.create('PARALLEL-EMIT-ERROR', { 
                errors: errors.map((er: any) => (er.error?.id ?? er.error?.message ?? null))
            })
        }
        return {
            returnValues,
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
        }
    }

    async emitSerialSafe(
        data: T, chunkSize = 1,
        completionCallback?: <TSuccess, TError>(_chunk: Result<TSuccess, TError>[]) => Promise<boolean>
    ): Promise<EventDispatchResult<R>> {
        const ids = Array.from(this.map.keys())
        const tasks = Array.from(this.map.entries())
            .map(([id, cb]) => () => (cb as EventCallbackAsynchronous<T, R>)(data, id))
        const chunks = await asyncSerialProcess<R>(tasks, chunkSize, completionCallback)
        const returnValues = (await gen2array(chunks))
            .flat()
            .map((res, index): EventResult<R> => pruneUndef({
                ok: res.ok,
                id: ids[index],
                error: res.error,
                returnValue: res.value,
            }) as EventResult<R>)
        return {
            returnValues,
        }
    }
}

function _wrapCallback<T, R>(id: JsonCode, callback: EventCallback<T, R>, throwX: boolean) {
    return (data: T) => {
        const cb = callback.synchronicity === 'async'
            ? callback as EventCallbackAsynchronous<T, R>
            : Object.assign(
                async function (arg: T) {
                    return callback(arg, id)
                },
                {
                    synchronicity: 'async'
                }
            )
        return cb(data, id)
            .then(returnValue => ({
                id,
                returnValue,
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
