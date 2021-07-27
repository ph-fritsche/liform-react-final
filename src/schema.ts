import { JSONSchema7Type } from 'json-schema'
import { LiformSchema } from './types'

// eslint-disable-next-line @typescript-eslint/ban-types
function isObject(thing: unknown): thing is object {
    return typeof thing === 'object' && thing !== null && !Array.isArray(thing);
}

function hasProp<K extends PropertyKey>(thing: unknown, key: K): thing is {[k in K]: unknown} {
    return Boolean(thing && typeof thing === 'object' && key in thing)
}

export function compileSchema<
    T extends LiformSchema|JSONSchema7Type,
>(
    schema: T,
    root: LiformSchema,
): T {
    if (isObject(schema)) {
        if ('$ref' in schema && schema['$ref']) {
            return compileSchema(
                resolveRef(schema['$ref'] as string, root) as T,
                root,
            );

        }
        return Object.fromEntries(Object.getOwnPropertyNames(schema).map(k => [
            k,
            compileSchema(schema[k as keyof T], root),
        ])) as unknown as T
    }

    if (Array.isArray(schema)) {
        return schema.map(v => compileSchema(v, root)) as T
    }

    return schema;
}

function resolveRef(
    uri: string,
    schema: LiformSchema,
) {
    uri = uri.replace('#/', '');

    let obj: unknown = schema
    for (const token of uri.split('/')) {
        obj = hasProp(obj, token) ? obj[token] : undefined
    }

    return obj;
}
