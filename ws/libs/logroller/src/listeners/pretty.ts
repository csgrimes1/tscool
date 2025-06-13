import { SeverityNumToName, LogRecord, verbosity } from '../types'

function _formatSourcePos(record: Pick<LogRecord, 'source'|'line'|'pos'>): string {
    if (!record.source || !record.line) return ''
    const fields = [record.source, record.line, record.pos]
    const text = fields
        .filter(f => f)
        .map(f => `${f}`)
        .join(':')
    return text ? ` ${text}` : ''
}

function _format(logrec: LogRecord) {
    const level = SeverityNumToName.get(logrec.level)
    const code = logrec.code ? ` ${logrec.code}` : ''
    const prefix = `[${logrec.dt} ${level}${_formatSourcePos(logrec)}${code}] `
    if (logrec.info && typeof logrec.info === 'object') {
        if (logrec.message) {
            const aggregate = { message: logrec.message, info: logrec.info }
            return `${prefix}${JSON.stringify(aggregate, null, 2)}`
        }
        return `${prefix}${JSON.stringify(logrec.info, null, 2)}`
    }
    return `${prefix}${logrec.message}`
}

function _prettyListener(logrec: LogRecord): unknown {
    const f = logrec.level === verbosity.error ? console.error : console.log
    f(_format(logrec))
    return undefined
}

export const prettyListener = Object.assign(_prettyListener, {
    code: 'prettyListener',
})
