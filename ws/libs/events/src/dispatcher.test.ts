import assert from 'assert'
import { basename } from 'path'
import { JsonCode } from '@tscool/tsutils'
import { EventDispatcher } from './dispatcher'

interface _EventType {
    readonly value: number
}

const _syncErrValue = 1001
const _asyncErrValue = 1002
const eventData = { value: 10 }

function _createDispatcher() {
    const disp = new EventDispatcher<_EventType, number>()
    const syncHandler = jest.fn((e: _EventType, code: JsonCode) => {
        if ( code === _syncErrValue ) throw new Error('syncerr')
        return Number.parseInt(`${code}`, 10) * e.value
    })
    disp.registerSync(syncHandler, 2)
    disp.registerSync(syncHandler, 3)
    const asyncHandler = jest.fn(async (e: _EventType, code: JsonCode) => {
        if ( code === _asyncErrValue ) throw new Error('asyncerr')
        return Number.parseInt(`${code}`, 10) * e.value
    })
    disp.registerAsync(asyncHandler, 4)
    disp.registerAsync(asyncHandler, 5)
    return {
        disp,
        syncHandler,
        asyncHandler,
    }
}

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must dispatch synchronously', () => {
        const { disp, syncHandler } = _createDispatcher()
        const result = disp.emitSync(eventData)
        assert.deepStrictEqual(
            result.returnValues,
            [
                {id: 2, ok: true, returnValue: 20},
                {id: 3, ok: true, returnValue: 30},
            ]
        )
        assert.deepStrictEqual(result, disp.emitSyncSafe(eventData))
        disp.registerSync(syncHandler, _syncErrValue)
        assert.throws(() => disp.emitSync(eventData))
        const r2 = disp.emitSyncSafe(eventData)
        const expected = (result.returnValues as Array<unknown>)
        assert.deepStrictEqual(
            r2.returnValues,
            expected.concat([{id: _syncErrValue, ok: false, error: new Error('syncerr')}])
        )
    })

    it('must dispatch asynchronously', async () => {
        const { disp, asyncHandler } = _createDispatcher()
        const result = await disp.emitSerialSafe(eventData)
        assert.deepStrictEqual(
            result.returnValues,
            [
                {id: 2, ok: true, returnValue: 20},
                {id: 3, ok: true, returnValue: 30},
                {id: 4, ok: true, returnValue: 40},
                {id: 5, ok: true, returnValue: 50},
            ]
        )
        assert.deepStrictEqual(result.returnValues, (await disp.emitParallel(eventData)).returnValues)
        assert.deepStrictEqual(result.returnValues, (await disp.emitParallelSafe(eventData)).returnValues)

        disp.registerAsync(asyncHandler, _asyncErrValue)
        const asyncExpected = 'caught'
        const r1 = await disp.emitParallel(eventData)
            .catch(() => asyncExpected)
        assert.strictEqual(r1, asyncExpected)
        const r2 = await disp.emitParallelSafe(eventData)
        const expected = (result.returnValues as Array<unknown>)
        assert.deepStrictEqual(
            r2.returnValues,
            expected.concat([{id: _asyncErrValue, ok: false, error: new Error('asyncerr')}])
        )
    })
})
