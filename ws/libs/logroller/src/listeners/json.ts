import { pruneUndef } from '@tscool/tsutils'
import { LogRecord, verbosity } from '../'

function _normalize(rec: LogRecord): LogRecord {
    return {
        level: rec.level,
        dt: rec.dt,
        ...pruneUndef({
            source: rec.source,
            line: rec.line,
            pos: rec.pos,
            code: rec.code,
            message: rec.message,
            info: rec.info,
        })
    }
}

function _jsonListener(event: LogRecord): unknown {
    const f = event.level === verbosity.error ? console.error : console.log
    f(JSON.stringify(_normalize(event)))
    return undefined
}

export const jsonListener = Object.assign(_jsonListener, {
    code: 'jsonListener',
})
