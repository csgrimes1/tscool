import assert from 'assert'
import { basename } from 'path'
import { chunk } from './chunk'


function *_gen(max: number) {
    for(let i=0; i<=max; i++) {
        yield i
    }
}

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must chunk an iterable', () => {
        const result = Array.from(
            chunk(_gen(10), 3)
        )
        assert.deepStrictEqual(result, [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [9, 10],
        ])
    })
})
