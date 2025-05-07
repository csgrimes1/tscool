export const CachedPropIndex = Symbol.for('CachedPropIndex')
const _accessorWrapper = Symbol.for('_accessorWrapper')

type _TMap = Map<string, unknown>
function _getMap(target: any) {
    const existingMap = target[CachedPropIndex] as _TMap | undefined
    return {
        existing: existingMap,
        effectiveMap: existingMap ?? new Map<string, unknown>
    }
}

function _makeAccessor(propertyKey: string, innerAccessor: () => unknown) {
    const f = function (this: any) {
        const gm = _getMap(this)
        if (gm?.effectiveMap?.has(propertyKey)) {
            return gm?.effectiveMap?.get(propertyKey)
        }
        if (!gm.existing) {
            this[CachedPropIndex] = gm.effectiveMap
        }
        const result = innerAccessor.call(this)
        gm.effectiveMap.set(propertyKey, result)
        return result
    }
    return Object.assign(f, {
        [_accessorWrapper]: true
    })
}

function _getAccessorWrapper(propertyKey: string, currentAccessor: () => unknown) {
        return (currentAccessor as any)?.[_accessorWrapper]
            ? null
            : _makeAccessor(propertyKey, currentAccessor)
}


export function cached() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const newAx = _getAccessorWrapper(propertyKey, descriptor.get as () => unknown)
        if (newAx) {
            descriptor.get = newAx
        }
    }
}
