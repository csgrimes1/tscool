import { Event } from '@tscool/events'
import { LevelNumToName, LogRecordEnvelope, verbosity } from '../types'

function _format(env: LogRecordEnvelope) {
    const logrec = env.data
    const level = LevelNumToName.get(logrec.level)
    const code = logrec.code ? ` ${logrec.code}` : ''
    const prefix = `[${logrec.dt} ${level} ${logrec.source}:${logrec.line}:${logrec.pos}${code}] `
    if (logrec.info && typeof logrec.info === 'object') {
        if (logrec.message) {
            const aggregate = { message: logrec.message, info: logrec.info }
            return `${prefix}${JSON.stringify(aggregate, null, 2)}`
        }
        return `${prefix}${JSON.stringify(logrec.info, null, 2)}`
    }
    return `${prefix}${logrec.message}`
}

export function prettyListener(event: Event<LogRecordEnvelope>): unknown {
    const logrec = event.data
    const f = logrec.data.level === verbosity.error ? console.error : console.log
    f(_format(logrec))
    return undefined
}
