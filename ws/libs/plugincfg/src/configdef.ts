import { JsonArray, SimplifyDeep } from 'type-fest'
import { ArrayAtLeastTwoElements, convertTo, JsonValue, toString } from '@tscool/tsutils'
import { VarName } from './namestrings'
import { err } from '@tscool/errors'

interface _Setting {
    readonly name: VarName
    readonly defaultValue: JsonValue
    readonly converter: _SettingConverter<JsonValue>
}

interface _SettingConverter<T extends JsonValue> {
    fromString(value: string): T
    toString(value: T): string
}

class _VarNameT<Name extends string>
    extends VarName
{
    constructor(readonly name: Name) {
        super(name)
    }
    static from<Name extends string>(value: Name): _VarNameT<Name> {
        return super.from(value) as _VarNameT<Name>
    }
}

interface _SettingT<Key extends string, T extends JsonValue>
    extends _Setting
{
    readonly name: _VarNameT<Key>
    readonly defaultValue: T
    readonly converter: _SettingConverter<T>
}

type _Typename = keyof typeof convertTo
function _implementSetting<Key extends string, T extends JsonValue>
    (typename: _Typename, name: Key, defaultValue: T): _SettingT<Key, T>
{
    const vn = _VarNameT.from(name)
    return {
        name: vn,
        defaultValue,
        converter: {
            fromString(value: string): T {
                const f = convertTo[typename] as unknown as (value: string, defaultValue: T) => T
                return f(value, defaultValue)
            },
            toString(value: T): string {
                return toString(value)
            }
        }
    }
}

/**
 * Represents environment variables and part or all of a JSON
 * configuration file.
 */
export interface ConfigSources {
    /**
     * Environment variables. Use process.env in NodeJS.
     */
    readonly env: Record<string, string>
    /**
     * A configuration body, either part or all of a JSON configuration file.
     */
    readonly jsonConfig: Record<string, JsonValue>
}


export class _ConfigurationBuilder<T> {
    constructor(readonly configSources: ConfigSources, private config: T) {}

    private static _load<Key extends string, TV extends JsonValue>(sources: ConfigSources, setting: _SettingT<Key, TV>): TV {
        const name = setting.name.asCamelCase as Key
        const value = setting.name.asSnakeCase in sources.env
            ? setting.converter.fromString(sources.env[setting.name.asSnakeCase])
            : name in sources.jsonConfig
            ? sources.jsonConfig[name]
            : setting.defaultValue
        return value as TV
    }

    addUnion<Key extends string, TUnion extends string>(name: Key, defaultValue: TUnion, ...options: ArrayAtLeastTwoElements<TUnion>) {
        const setting = _implementSetting('string', name, defaultValue)
        const value = _ConfigurationBuilder._load(this.configSources, setting)
        if ( !options.includes(value) ) {
            throw err.create('ILLEGAL-SETTING-ENUM-VALUE', { value })
        }
        type _T = {
            readonly [k in Key]: TUnion
        }
        const newConfig = {
            ...this.config,
            [name]: value,
        } as SimplifyDeep<T & _T>
        return new _ConfigurationBuilder(this.configSources, newConfig)
    }

    addArray<Key extends string, TArray extends JsonValue[]>(name: Key, defaultValue: TArray) {
        const setting = _implementSetting('array', name, defaultValue)
        const value = _ConfigurationBuilder._load(this.configSources, setting)
        type _T = {
            readonly [k in Key]: TArray
        }
        const newConfig = {
            ...this.config,
            [name]: value,
        } as SimplifyDeep<T & _T>
        return new _ConfigurationBuilder(this.configSources, newConfig)
    }

    addString<Key extends string>(name: Key, defaultValue: string) {
        const setting = _implementSetting('string', name, defaultValue)
        const value = _ConfigurationBuilder._load(this.configSources, setting)
        type _T = {
            readonly [k in Key]: string
        }
        const newConfig = {
            ...this.config,
            [name]: value,
        } as SimplifyDeep<T & _T>
        return new _ConfigurationBuilder(this.configSources, newConfig)
    }

    addInt<Key extends string>(name: Key, defaultValue: number) {
        const setting = _implementSetting('int', name, defaultValue)
        const value = _ConfigurationBuilder._load(this.configSources, setting)
        type _T = {
            readonly [k in Key]: number
        }
        const newConfig = {
            ...this.config,
            [name]: value,
        } as SimplifyDeep<T & _T>
        return new _ConfigurationBuilder(this.configSources, newConfig)
    }

    addFloat<Key extends string>(name: Key, defaultValue: number) {
        const setting = _implementSetting('float', name, defaultValue)
        const value = _ConfigurationBuilder._load(this.configSources, setting)
        type _T = {
            readonly [k in Key]: number
        }
        const newConfig = {
            ...this.config,
            [name]: value,
        } as SimplifyDeep<T & _T>
        return new _ConfigurationBuilder(this.configSources, newConfig)
    }

    addBoolean<Key extends string>(name: Key, defaultValue: boolean) {
        const setting = _implementSetting('boolean', name, defaultValue)
        const value = _ConfigurationBuilder._load(this.configSources, setting)
        type _T = {
            readonly [k in Key]: boolean
        }
        const newConfig = {
            ...this.config,
            [name]: value,
        } as SimplifyDeep<T & _T>
        return new _ConfigurationBuilder(this.configSources, newConfig)
    }

    /**
     * Final builder operation. Returns the assembled configuration.
     * @returns Returns a strongly-typed configuration object.
     */
    build(): T {
        return this.config
    }
}

/**
 * Starts a chainable operation in which every line defines a setting
 * with a type and a default. At the final line, you call build() to
 * render a well-typed configuration object.
 * @param configSources The program environment and config file.
 * @returns A builder to fluently add settings with defaults.
 */
export function createConfiguration(configSources: ConfigSources) {
    return new _ConfigurationBuilder(configSources, {})
}

export async function importConfiguration(configSources: ConfigSources, moduleName: string) {
    const moduleConfig = await import(moduleName)
    const csFinal: ConfigSources = {
        ...configSources,
        ...moduleConfig,
    }
    return createConfiguration(csFinal)
}
