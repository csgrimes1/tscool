// import { err } from '@tscool/errx'

// const e = err.create(1234, {x: 1})
// console.log(e, 'Hello, ...world?')
import { makeModuleLog } from '@tscool/logroller'

const log = makeModuleLog()

class C {
    constructor(x: any) {
        console.log('Making object')
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
    console.log('dumping')
    // console.log(log, '<<<<<<<<<')
    log?.error?.coded('yo', 'error', {a: 'b'})
    log?.info?.coded('yo', 'info', {a: 'info'})
    log?.debug?.coded('yo', 'debug', {a: 'debug'})
}

_x.unset?.create(dumpstuff())
_x.bound?.create(dumpstuff())
