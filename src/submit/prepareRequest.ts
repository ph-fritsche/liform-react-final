import { LiformApi } from '../types'
import { htmlizeName } from '../util'

function isPlainObject(val: unknown): val is Record<PropertyKey, unknown> {
    return typeof val === 'object' && Object.getPrototypeOf(val).constructor === Object
}

export function prepareRequest(
    values: unknown,
    liform: LiformApi,
): RequestInit {
    let multipart = false
    const form = new FormData()

    function walk(val: unknown, path = ['_']) {
        if (Array.isArray(val)) {
            val.forEach((v, i) => walk(v, path.concat(String(i))))
        } else if (isPlainObject(val)) {
            Object.keys(val).forEach(k => walk(val[k], path.concat(k)))
        } else {
            if (typeof val === 'object') {
                if (val instanceof Blob) {
                    multipart = true
                }
            }
            const key = htmlizeName(path.join('.'), liform.rootName)
            form.append(key, val instanceof Blob ? val : String(val))
        }
    }
    walk(values)

    return multipart
        ? {
            method: 'POST',
            body: form,
        }
        : {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ [liform.rootName]: values }),
        }
}

