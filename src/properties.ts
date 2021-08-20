import { JSONSchema7Definition } from 'json-schema'

type LiformProperties = Record<string, JSONSchema7Definition & { propertyOrder?: number }>

export function sortPropertyKeys<
    T extends LiformProperties,
>(
    properties: T,
): (keyof T)[] {
    return Object.keys(properties).sort((keyA, keyB) => {
        const posA = Number.isFinite(properties[keyA].propertyOrder)
            ? properties[keyA].propertyOrder as number
            : 1000
        const posB = Number.isFinite(properties[keyB].propertyOrder)
            ? properties[keyB].propertyOrder as number
            : 1000
        return posA === posB ? 0 : posA < posB ? -1 : 1
    })
}

export function sortProperties<
    T extends LiformProperties,
>(
    properties: T,
): T {
    const object: Partial<T> = {}

    sortPropertyKeys(properties).forEach(key => {
        object[key] = properties[key]
    })

    return object as T
}

export function mapProperties<
    T extends LiformProperties,
    R extends unknown,
>(
    properties: T,
    callback: <K extends keyof T>(v: T[K], k: K) => R,
): R[] {
    return sortPropertyKeys(properties).map(key => callback(properties[key], key))
}
