import assert from 'assert'
import { basename } from 'path'
import { hmac } from './hmac'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must create a canonical hmac', () => {
        const result = hmac('key', 'data')
        // Used web site for this...
        const expected = '5031fe3d989c6d1537a013fa6e739da23463fdaec3b70137d828e36ace221bd0'
        assert.strictEqual(result, expected)
        const notResult = hmac('notkey', 'data')
        assert.notStrictEqual(notResult, expected)
    })
})
