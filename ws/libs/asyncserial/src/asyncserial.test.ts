import assert from 'assert'
import { gen2array, range } from '@tscool/tsutils'
import { basename } from 'path'
import { asyncSerialProcess } from './asyncserial'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    const spies = Array.from(range(0, 8))
        .map(i => jest.fn(() => Promise.resolve(i)))

    beforeEach(() => {
        spies.forEach(spy => spy.mockClear())
    })

    it('must run operations in chunks', async () => {
        const res = await asyncSerialProcess(spies, 5)
        const chunks = await gen2array(res)
        assert.strictEqual(chunks[0].length, 5)
        assert.strictEqual(chunks[1].length, 3)
        const result = chunks.flatMap(items => items.map(i => i.value))
        assert.deepStrictEqual(result, [0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('must stop for a completion callback', async () => {
        const res = await asyncSerialProcess(spies, 5, () => Promise.resolve(false))
        const chunks = await gen2array(res)
        assert.strictEqual(chunks.length, 1)
        assert.strictEqual(chunks[0].length, 5)
        const result = chunks.flatMap(items => items.map(i => i.value))
        assert.deepStrictEqual(result, [0, 1, 2, 3, 4])
    })
})
