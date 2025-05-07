import assert from 'assert'
import { basename } from 'path'
import { err } from './coded-error'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must create an error', () => {
        const info = {a: 'b'}
        const e = err.create('foo', info)
        assert.strictEqual(e.code, 'foo')
        assert.deepStrictEqual(e.info, info)
        assert(e.stackFrames.length > 1)
        assert.match(e.stackFrames[0].file, /\/coded-error\.test\.ts$/)
    })

    it('must code a naked error', () => {
        const e = new Error('WHAT')
        const ce = err.coded(e)
        assert((ce as any).stack)
        assert(ce?.stackFrames?.length ?? -1 > 0)
        assert.strictEqual(ce?.code, 'WHAT')
    })

    it('must override code, merge info, and copy inner error of raw source', () => {
        const inner = new Error('inner')
        const e = Object.assign(new Error('never'), {
            inner,
            info: {a: 1},
            code: 'better not'
        })
        const ce = err.coded(e, 'WOOF!', {b: 2})
        assert.strictEqual(ce?.code, 'WOOF!')
        assert.strictEqual(ce?.inner?.code, 'inner')
        assert.deepStrictEqual(ce.info, {a: 1, b: 2})
    })
})
