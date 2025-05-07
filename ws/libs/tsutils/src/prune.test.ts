import assert from 'assert'
import { basename } from 'path'
import { prune, pruneUndef } from './prune'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must omit fields matching a rule on an object', () => {
        const res = prune({
            a: undefined,
            b: null,
            c: 0,
            d: 'xxx'
        }, (v) => v === null || v === undefined)
        assert.deepStrictEqual(res, {c: 0, d: 'xxx'})
    })

    it('must omit undefineds', () => {
        const res = pruneUndef({
            a: 2,
            b: undefined,
            c: null,
            d: 'xxx'
        })
        assert.deepStrictEqual(res, {a: 2, c: null, d: 'xxx'})
    })
})
