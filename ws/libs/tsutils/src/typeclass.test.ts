import assert from 'assert'
import { basename } from 'path'
import { isNil } from 'ws/libs/tsutils/src/typeclass'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must detect nil values', () => {
        assert.strictEqual(isNil(null), true)
        assert.strictEqual(isNil(undefined), true)
        assert.strictEqual(isNil(false), false)
        assert.strictEqual(isNil(''), false)
        assert.strictEqual(isNil(0), false)
    })
})
