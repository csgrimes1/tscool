import assert from 'assert'
import { basename } from 'path'
import { range } from './counting'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must create a simple range', () => {
        const res = Array.from(range(5))
        assert.deepStrictEqual(res, [0, 1, 2, 3, 4])
    })

    it('must create a range with starting offset', () => {
        const res = Array.from(range(1, 5))
        assert.deepStrictEqual(res, [1, 2, 3, 4])
    })

    it('must create a descending range', () => {
        const res = Array.from(range(0, -5, -1))
        assert.deepStrictEqual(res, [0, -1, -2, -3, -4])
    })
})
