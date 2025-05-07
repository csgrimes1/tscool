import assert from 'assert'
import { basename } from 'path'
import { stringifyJson } from './object-formatter'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    const x = {
        a: 12345n,
        b: {
            c: Symbol.for('whatever'),
            u: undefined
        },
        u: undefined,
    }
    it('should stringify troublesome types', () => {
        const result = stringifyJson(x)
        assert.strictEqual(result, '{"a":"12345n","b":{"c":"Symbol(whatever)","u":null},"u":null}')
    })
})
