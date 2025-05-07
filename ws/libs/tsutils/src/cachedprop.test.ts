import assert from 'assert'
import { basename } from 'path'
import { cached, CachedPropIndex } from './cachedprop'

interface _IC {
    a(): number
    b(): number
}

class _C {
    constructor(readonly source: _IC) {}

    @cached()
    get a() {
        return this.source.a()
    }

    @cached()
    get b() {
        return this.source.b()
    }
}

Object.assign(_C, { foo: 'barz' })

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must cache a property', () => {
        const ic = {
            a: jest.fn(() => 1),
            b: jest.fn(() => 2),
        } satisfies _IC
        const inst = new _C(ic)
        assert.strictEqual(inst.a, 1)
        const map = (inst as any)[CachedPropIndex]
        assert(map)
        assert.strictEqual(inst.a, 1)
        assert.strictEqual(inst.a, 1)
        assert.strictEqual(map, (inst as any)[CachedPropIndex])
        assert.strictEqual(ic.a.mock.calls.length, 1)
        assert.strictEqual(inst.b, 2)
        assert(inst.b)
        assert(inst.b)
        assert.strictEqual(ic.b.mock.calls.length, 1)
    })
})
