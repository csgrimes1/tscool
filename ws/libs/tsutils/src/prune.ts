export function prune<T extends Record<string, unknown>>(target: T, omitRule: (value: unknown, key: string) => boolean): Partial<T>
{
    return Object.assign({}, ...Object
        .entries(target)
        .filter(([k, v]) => !omitRule(v, k))
        .map(([k, v]) => ({[k]: v}))
    )
}

export function pruneUndef<T extends Record<string, unknown>>(target: T): Partial<T>
{
    return prune<T>(target, (v) => v === undefined)
}
