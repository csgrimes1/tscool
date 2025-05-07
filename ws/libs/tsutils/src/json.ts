import { isNil } from 'ws/libs/tsutils/src/typeclass'

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = {[Key in string]: JsonValue} & {[Key in string]?: JsonValue | undefined}
export type JsonArray = JsonValue[] | readonly JsonValue[]
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type JsonCode = number | string

function _fail(value: JsonValue, toType: string) {
    throw Object.assign(
        new Error('Conversion failed'),
        {
            code: 'CONVERSION-FAILED',
            info: {
                value, toType,
            }
        }
    )
}

export function toInt(value: JsonValue, defaultValue?: number): number {
    if (Number.isInteger(value)) return value as number
    const parsed = parseInt(String(value), 10)
    if (isNaN(parsed)) {
        if (Number.isInteger(defaultValue)) return defaultValue as number
        _fail(value, 'int')
    }
    return parsed
}

export function toFloat(value: JsonValue, defaultValue?: number): number {
    if (typeof value === "number") return value
    const parsed = parseFloat(String(value))
    if (isNaN(parsed)) {
        if (Number.isFinite(defaultValue)) return defaultValue as number
        _fail(value, 'float')
    }
    return parsed
}

export function toBoolean(value: JsonValue, defaultValue?: boolean): boolean {
    if (typeof value === "boolean") return value
    if (isNil(value) && !isNil(defaultValue)) return defaultValue as boolean
    if (typeof value === "string") {
        switch(value.toLowerCase()) {
            case 'true':
                return true
            case 'false':
                return false
        }
        const v = Number.parseInt(value, 10)
        if (Number.isFinite(v)) return !!v
    }
    _fail(value, 'boolean')
    return !!defaultValue
}

export function toString(value: JsonValue, defaultValue?: string): string {
    if (isNil(value)) {
        if (typeof defaultValue === 'string') return `${defaultValue}`
        _fail(value, 'string')
    }
    return `${value}`
}

export function toArray(value: JsonValue, defaultValue?: JsonArray): JsonArray {
    if (Array.isArray(value)) return value as JsonArray
    if(isNil(value)) {
        if (Array.isArray(defaultValue)) return defaultValue
        _fail(value, 'array')
    }
    if(typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.match(/^\[.*\]$/)) {
            try {
                return JSON.parse(trimmed)
            } catch {}
        }
        return Array.from(value)
    }
    _fail(value, 'array')
    return []
}

export const convertTo = {
    int: toInt,
    float: toFloat,
    boolean: toBoolean,
    string: toString,
    array: toArray,
}
