import { Expiring } from './expiring'
import { MILLISECONDS } from './timeconst'

export class Cache<K, T> {
    private _entries = new Map<K, Expiring<T>>()
    constructor() {
    }

    private _prune() {
        const exps = Array.from(this._entries.entries())
            .filter(([__k, x]) => x.expired)
            .map(([k]) => k)
        exps.forEach(k => this._entries.delete(k))
    }

    clear() {
        this._entries.clear()
    }

    add(key: K, val: T, expiry: MILLISECONDS) {
        this._prune()
        const entry = new Expiring(val, expiry)
        if (entry.expired) {
            return this
        }
        this._entries.set(key, entry)
        return this
    }

    get(key: K): T|undefined {
        this._prune()
        return this._entries.get(key)?.target
    }

    access(k: K, create: () => Expiring<T>): T|undefined {
        const result = this.get(k)
        if (result === undefined ) {
            const x = create()
            const value = x.target
            if ( value !== undefined) {
                this.add(k, value, x.expiry)
                // This could be expired.
                return x.target
            }
        }
        return result
    }

    get size(): number {
        this._prune()
        return this._entries.size
    }
}

export function once<T>(initializer: () => T): () => T
{
    const result = initializer()
    return () => result
}
