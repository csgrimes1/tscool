import assert from 'assert'
import { basename } from 'path'
import { gen2array } from './asynciterate'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    async function * _ait (length: number) {
        const promises = Array.from(new Array(length))
            .map((__x, i) => Promise.resolve(i))
        for (const p of promises) {
            yield p
        }
    }

    it('must convert an async iterable to an array', async () => {
        const result = await gen2array(_ait(5))
        assert.deepStrictEqual(result, [0, 1, 2, 3, 4])
    })
})
