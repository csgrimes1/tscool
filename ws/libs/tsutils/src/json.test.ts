import assert from 'assert'
import { basename } from 'path'
import { convertTo, toArray, toBoolean, toFloat, toInt, toString } from 'ws/libs/tsutils/src/json'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must convert to integer', () => {
        assert.strictEqual(toInt(1), 1)
        assert.strictEqual(toInt(1.0), 1)
        assert.strictEqual(toInt(1.1), 1)
        assert.strictEqual(toInt(null, 2), 2)
        assert.strictEqual(toInt('3'), 3)
        assert.strictEqual(toInt('3.0'), 3)
        assert.strictEqual(convertTo.int('3.4'), 3)
        assert.throws(() => toInt(null))
    })

    it('must convert to float', () => {
        assert.strictEqual(toFloat(2), 2.0)
        assert.strictEqual(toFloat(-5.4), -5.4)
        assert.strictEqual(toFloat('-5.4'), -5.4)
        assert.strictEqual(convertTo.float('', 3.2), 3.2)
        assert.throws(() => toFloat(''))
    })

    it('must convert to boolean', () => {
        assert.strictEqual(toBoolean('TRue', false), true)
        assert.strictEqual(toBoolean('FALSE'), false)
        assert.strictEqual(toBoolean('10', false), true)
        assert.strictEqual(toBoolean('0'), false)
        assert.strictEqual(toBoolean(false), false)
        assert.strictEqual(toBoolean(true), true)
        assert.strictEqual(convertTo.boolean(null, true), true)
        assert.throws(() => toBoolean(null))
    })

    it('must convert to string', () => {
        assert.strictEqual(toString(true), 'true')
        assert.strictEqual(toString(3.5), '3.5')
        assert.strictEqual(toString('hello'), 'hello')
        assert.strictEqual(convertTo.string(null, 'hello'), 'hello')
        assert.throws(() => toString(null))
    })

    it('must convert to array', () => {
        assert.deepStrictEqual(toArray(['a']), ['a'])
        assert.deepStrictEqual(toArray('abc'), ['a', 'b', 'c'])
        assert.deepStrictEqual(toArray('["abc", "def"]'), ['abc', 'def'])
        assert.throws(() => toArray(null))
        assert.throws(() => toArray(1))
        assert.throws(() => toArray(false))
    })
})
