import { dirname, join, isAbsolute, basename } from 'path'
import { existsSync, readFileSync } from 'fs'
import { ArrayAtLeastOneElement, JsonValue, RecursionContext, tailRecurse } from '@tscool/tsutils'

type _PathType = string|undefined

const firstModule: _PathType = require?.main?.path

export function defaultEtcConfigFile(moduleName: string) {
    const mainName = require?.main?.filename
    if (!mainName) return undefined
    const shortName = basename(mainName).replace(/\.[tj]s$/, '')
    return `/etc/${shortName}/${moduleName}.cfg.json`
}

function _checkPath(fname: string, path: _PathType, rc: RecursionContext<_PathType, _PathType>) {
    if ( path === undefined ) return undefined
    if ( path === '' ) return undefined

    const pkgFile = join(path, fname)
    if ( existsSync(pkgFile) ) return pkgFile

    const parent = dirname(path)
    if (parent === path) return undefined
    return rc.recurse(dirname(path))
}

export function findModuleFile(fileName='package.json'): string|undefined
{
    if (isAbsolute(fileName)) {
        return existsSync(fileName) ? fileName : undefined
    }
    return tailRecurse(fileName, firstModule, _checkPath, { maxCalls: 20 })
}

export type ConfigExtractor<T> = (json: Record<string, JsonValue>) => Partial<T>|undefined

export function _loadModuleConfig<T>(extractor: ConfigExtractor<Partial<T>>, configFile: string): Partial<T>|undefined {
    const cfgFile = findModuleFile(configFile)
    if (!cfgFile) return undefined

    const text = readFileSync(cfgFile).toString()
    const json = JSON.parse(text)
    return extractor(json)
}

export function loadModuleConfig<T>(extractor: ConfigExtractor<Partial<T>>, ...configFiles: ArrayAtLeastOneElement<string>): Partial<T>|undefined {
    const results = configFiles
        .map(f => _loadModuleConfig(extractor, f) ?? {})
    return Object.assign({}, ...results)
}
