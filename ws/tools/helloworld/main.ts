// import { err } from '@tscool/errors'

// const e = err.create(1234, {x: 1})
// console.log(e, 'Hello, ...world?')
import { makeModuleLog } from '@tscool/logroller'

const log = makeModuleLog()

class C {
    constructor(x: any) {
        log?.debug?.text('Making object', {x})
    }
}

const ctor = {
    create: (x: any) => new C(x)
}

type T = typeof ctor | undefined

const unset: T = undefined
const bound: T = ctor

const _x: Record<string, T> = {
    unset,
    bound,
}

function dumpstuff() {
    log?.error?.coded('yo', 'error', {a: 'b'})
    log?.info?.coded('yo', 'info', {a: 'info'})
    log?.debug?.coded('yo', 'debug', {a: 'debug'})
    log?.warn?.text('wake up, bro')
}

_x.unset?.create(dumpstuff())
_x.bound?.create(dumpstuff())
