import assert from 'assert'
import { basename } from 'path'
import { defer, delay } from './defer'

describe(`${basename(module.filename, '.test.js')} module`, () => {
    it('must defer a promise', async () => {
        const expected = 1234
        const d = defer()
        setTimeout(() => d.resolve(expected), 10)
        const result = await d.promise
        assert.strictEqual(result, expected)
    })

    it('must defer rejection', async () => {
        const err = new Error('WTPh?')
        const d = defer()
        assert.strictEqual(d.state, 'pending')
        try {
            setTimeout(() => d.reject(err))
            await d.promise
            assert(false)
        } catch (e) {
            assert.strictEqual(e, err)
            assert.strictEqual(d.state, 'rejected')
        }
    })

    it('must defer using a callback', async () => {
        const expected = 2112
        const d = defer()
        assert.strictEqual(d.state, 'pending')
        const result = await d.settle(async () => expected)
        assert.strictEqual(result, expected)
        assert.strictEqual(d.state, 'resolved')
    })

    it('must defer errors using a callback', async () => {
        const err = new Error('????')
        try {
            const d = defer()
            await d.settle(() => {
                throw err
            })
            assert(false)
        } catch (e) {
            assert.strictEqual(e, err)
        }
    })

    it('must run an asynchronous delay', async () => {
        const t0 = Date.now()
        const timeout = 10
        await delay(timeout)
        const t1 = Date.now()
        assert(t1 - t0 >= timeout)
    })
})
