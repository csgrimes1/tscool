import assert from 'assert'
import { basename } from 'path'
import { JsonCode } from '@tscool/tsutils'
import { EventDispatcher } from './dispatcher'

interface _EventType {
    readonly value: number
}

function _createDispatcher() {
    return new EventDispatcher<_EventType, number>()
}

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must dispatch synchronously', () => {
        const disp = _createDispatcher()
        const handler = jest.fn((e: _EventType, code: JsonCode) => {
            return Number.parseInt(`${code}`, 10) * e.value
        })
        disp.registerSync(handler, 2)
        const result = disp.emitSync({value: 10})
        assert.deepStrictEqual(
            result.returnValues,
            [{id: 2, ok: true, returnValue: 20}]
        )
    })
})
