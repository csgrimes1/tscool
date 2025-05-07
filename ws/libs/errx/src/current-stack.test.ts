import assert from 'assert'
import { basename } from 'path'
import { getCurrentStack, getCurrentStackFrames } from './current-stack'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must create a stack trace as text', () => {
        const st = getCurrentStack()
        assert.strictEqual(typeof st, 'string')
    })

    it('must create stack frames', () => {
        const frames = getCurrentStackFrames(500)
        assert(frames.length > 0)
    })
})
