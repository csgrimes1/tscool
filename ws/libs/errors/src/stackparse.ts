import { StackFrame } from './types'


export function parseStackLine(text: string): StackFrame|undefined {
    const _regex = /(?<funcname>([\w_.]+\s+\()|([\w_]+@))?((?<filename>[\w._/-]+):(?<line>\d+):(?<col>\d+))/g
    const match = _regex.exec(text.replace('(<anonymous>)', '(-:0:0)'))
    const groups = match?.groups ?? {}
    const sf = {
        funcname: groups.funcname?.replace(' (', ''),
        file: groups.filename,
        line: Number.parseInt(groups.line, 10),
        column: Number.parseInt(groups.col, 10),
    }
    const valid = sf.file || sf.funcname
    if (!valid) {
        return undefined
    }
    return {
        funcname: sf.funcname ?? '',
        file: sf.file ?? '',
        line: sf.line ?? 0,
        column: sf.column ?? 0,
        toString(): string {
            return this.funcname
                ? `${this.funcname} (${this.file}:${this.line}:${this.column})`
                : `${this.file}:${this.line}:${this.column}`
        }
    }
}

export function parseStack(stack: string|undefined): StackFrame[]
{
    if (stack === undefined) return []
    return stack.split('\n')
        .map(parseStackLine)
        .filter(sf => sf) as StackFrame[]
}
