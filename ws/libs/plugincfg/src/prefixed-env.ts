
export function selectPrefixedSettings(prefix: string, env: Record<string, string|undefined>) {
    const pfxNorm = `${prefix.toUpperCase()}_`
    return Object.assign({}, ...Object.entries(env)
        .filter(([_k, value]) => value !== undefined)
        .filter(([key]) => key.startsWith(pfxNorm))
        .map(([k, v]) => ({ [k.slice(pfxNorm.length)]: v }))
    )
}
