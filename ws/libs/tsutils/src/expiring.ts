import { MILLISECONDS } from './timeconst'

export class Expiring<T> {
    constructor(private _target: T, readonly expiry: MILLISECONDS, readonly createdTime = new Date()) {
    }

    get expired(): boolean {
        return Date.now() - this.createdTime.getTime() >= this.expiry
    }

    get target(): T|undefined {
        return this.expired ? undefined : this._target
    }
}
