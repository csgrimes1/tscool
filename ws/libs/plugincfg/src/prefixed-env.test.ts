import assert from 'assert'
import { basename } from 'path'
import { selectPrefixedSettings } from './prefixed-env'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must select settings from an environment map', () => {
        const env = {
            MY_VAR_1: 'a',
            MY_VAR_2: 'b',
            OTHER: 'c',
            UNDEF: undefined,
        }
        const result = selectPrefixedSettings('my', env)
        assert.deepStrictEqual(result, {
            VAR_1: 'a',
            VAR_2: 'b',
        })
    })
})
