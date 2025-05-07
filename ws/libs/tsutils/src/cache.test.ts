import assert from 'assert'
import { basename } from 'path'
import { Cache, once } from './cache'
import { Expiring } from './expiring'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    const _cache = new Cache<string, string>

    beforeEach(() => {
        _cache.clear()
    })

    it('must cache items', () => {
        const k = 'key'
        const val = 'value'
        _cache.add(k, val, 60000)
        assert.strictEqual(_cache.get(k), val)
    })

    it('must support expiry', async () => {
        const k = 'key'
        const val = 'value'
        assert.strictEqual(_cache.size, 0)
        _cache.add(k, val, -60000)
        assert.strictEqual(_cache.size, 0)
        assert.strictEqual(_cache.get(k), undefined)
        _cache.add(k, val, 100)
        assert.strictEqual(_cache.size, 1)
        await new Promise(resolve => setTimeout(resolve, 150))
        assert.strictEqual(_cache.size, 0)
    })

    it('must use a callback to create an entry that is not present', () => {
        const k = 'key'
        const val = 'bar'
        const spy = jest.fn(() => new Expiring(val, 5000))
        const entryVal = _cache.access(k, spy)
        assert.strictEqual(entryVal, val)
        assert.strictEqual(spy.mock.calls.length, 1)
        assert.strictEqual(_cache.access(k, spy), val)
        assert.strictEqual(spy.mock.calls.length, 1, 'must only call constructor when key not present')
    })

    it('must support one time calls', () => {
        const result = 12345
        const spy = jest.fn(() => result)
        const callback = once(spy)
        const results = [
            callback(),
            callback(),
            callback(),
        ]
        assert.deepStrictEqual(results, [result, result, result])
        assert.strictEqual(spy.mock.calls.length, 1)
    })
})
