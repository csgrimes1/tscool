import { err } from '@tscool/errx'
import { cached } from '@tscool/tsutils'

const _sr = /^[A-Z][A-Z0-9]+(_[A-Z0-9]+)*$/
const _cr = /^[a-z][a-z0-9]+([A-Z][a-z0-9]*)*$/
const _camelSplitter = /([A-Z])/
const _camelSplitterMatch = /[A-Z]/

export type VarNameType = 'illegal' | 'snake' | 'camel'

export class VarName {
    constructor(readonly value: string) {}

    static isLegalCamelCase(value: string): boolean {
        return _cr.test(value)
    }

    static camelToSnake(value: string) {
        const dummy = '❕'
        const tokens = value.split(_camelSplitter, 10000)
            .map(token => token.match(_camelSplitterMatch)
                ? `${token}${dummy}`
                : token
            )
            .map(token => token.toUpperCase())
        return tokens.join('_').replace(/❕[_]/g, '')
    }

    static isLegalSnakeCase(value: string): boolean {
        return _sr.test(value)
    }

    static snakeToCamel(value: string) {
        const tokens = value.split('_')
            .map((token, index) => index === 0
                ? token.toLowerCase()
                : `${token.substring(0, 1).toUpperCase()}${token.substring(1).toLowerCase()}`
            )
        return tokens.join('')
    }

    static classify(value: string): VarNameType {
        return this.isLegalCamelCase(value)
            ? 'camel'
            : this.isLegalSnakeCase(value)
            ? 'snake'
            : 'illegal'
    }

    static from(value: string): VarName {
        const vn = new VarName(value)
        if (vn.nameCase === 'illegal') {
            throw err.create('ILLEGAL-CONFIG-VARNAME', value)
        }
        return vn
    }

    @cached()
    get nameCase() {
        if (VarName.isLegalCamelCase(this.value))
            return 'camel'
        if (VarName.isLegalSnakeCase(this.value))
            return 'snake'
        return 'illegal'
    }

    get asSnakeCase() {
        switch(this.nameCase) {
            case 'snake':
                return this.value
            case 'camel':
                return VarName.camelToSnake(this.value)
            default:
                return ''
        }
    }

    get asCamelCase() {
        switch(this.nameCase) {
            case 'camel':
                return this.value
            case 'snake':
                return VarName.snakeToCamel(this.value)
            default:
                return ''
        }
    }
}
