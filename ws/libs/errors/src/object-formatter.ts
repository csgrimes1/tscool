export function safeJsonvalue(k: any, v: any) { // eslint-disable-line
    if (!k) return v
    if (v === undefined) {
        return null
    }
    switch (typeof v) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'object':
            return v
        case 'bigint':
            return `${v}n`
        case 'symbol':
            return v.toString()
        default:
            return `${v}`
    }
}

export function stringifyJson(target: unknown, replacer = safeJsonvalue, space?: string | number): string {
    if (target === undefined) return 'null'
    return JSON.stringify(target, replacer, space)
}
