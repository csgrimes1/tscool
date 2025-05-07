import assert from 'assert'
import { basename } from 'path'
import { Expiring } from './expiring'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must expire objects', () => {
        const exp = new Expiring(123, 1, new Date(Date.now() - 2))
        assert(exp.expired)
        assert.strictEqual(exp.target, undefined)
    })

    it('must hold object reference before expiry', () => {
        const val = 123
        const exp = new Expiring(val, 1000)
        assert(!exp.expired)
        assert.strictEqual(exp.target, val)
    })
})
