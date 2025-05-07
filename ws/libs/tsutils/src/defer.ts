import { MILLISECONDS } from './timeconst'

export type DeferredPromiseState = 'pending' | 'resolved' | 'rejected'

export class Deferred<T> {
    #p: Promise<T>
    
    private _state: DeferredPromiseState = 'pending'
    resolve: (value: T|PromiseLike<T>) => void = () => {}
    reject: (value?: unknown) => void = () => {}

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        this.#p = new Promise((resolve, reject) => {
            self.resolve = resolve
            self.reject = reject
        })
            .then((result) => {
                self._state = 'resolved'
                return result as T
            })
            .catch(e => {
                self._state = 'rejected'
                return Promise.reject(e)
            })
    }

    get promise() {
        return this.#p
    }

    get state(): DeferredPromiseState {
        return this._state
    }

    async settle(callback: () => Promise<T>): Promise<T> {
        try {
            this.resolve(await callback())
            return this.#p
        } catch (e) {
            this.reject(e)
            await this.#p
            return this.#p
        }
    }
}

export function defer<T>(): Deferred<T> {
    return new Deferred<T>()
}

export function delay(time: MILLISECONDS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time))
}
