import assert from 'assert'
import { basename } from 'path'
import { VarName } from './namestrings'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must support regex testing of names', () => {
        assert(VarName.isLegalCamelCase('abc2'))
        assert(!VarName.isLegalSnakeCase('abc2'))
        assert(!VarName.isLegalCamelCase('1abc2'))
        assert(!VarName.isLegalSnakeCase('1ABC_DEF'))
    })

    it('must parse a camelCase variable name', () => {
        const value = 'camelCaseName'
        const vn = new VarName(value)
        assert.strictEqual(vn.nameCase, 'camel')
        assert.strictEqual(vn.asCamelCase, value)
        assert.strictEqual(vn.asSnakeCase, 'CAMEL_CASE_NAME')
    })

    it('must parse a camelCase variable name', () => {
        const value = 'SNAKEY_CASE_NAME'
        const vn = new VarName(value)
        assert.strictEqual(vn.nameCase, 'snake')
        assert.strictEqual(vn.asSnakeCase, value)
        assert.strictEqual(vn.asCamelCase, 'snakeyCaseName')
    })

    it('must support short alphanumeric names', () => {
        const value = 'x234'
        const vn = new VarName(value)
        assert.strictEqual(vn.asCamelCase, value)
        assert.strictEqual(vn.asSnakeCase, 'X234')
    })
})
