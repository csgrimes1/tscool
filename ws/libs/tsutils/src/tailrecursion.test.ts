import assert from 'assert'
import { basename } from 'path'
import { RecursionContext, tailRecurse } from 'ws/libs/tsutils/src/tailrecurse'

interface ExponentiationParam {
    readonly base: number
    readonly exponent: number
}

function _powerOfImplementation(args: ExponentiationParam, product: number, context: RecursionContext<number, number>): number {
    if (context.callCount >= args.exponent) return product
    return context.recurse(product * args.base)
}

function _powerOf(base: number, exponent: number) {
    assert(Number.isInteger(exponent), 'Exponent must be integer')
    assert(exponent >= 1, 'Exponent must be >= 1')
    const args: ExponentiationParam = {
        base, exponent
    }
    return tailRecurse(args, base, _powerOfImplementation, { maxCalls: exponent })
}

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must support fake tail recursion', () => {
        assert.strictEqual(_powerOf(2, 3), 8)
        const res = _powerOf(1.01, 150)
        assert(Number.isFinite(res))
        assert(res > 2)
        assert(res > _powerOf(1.01, 149))
    })
})
