export const shallowEqual = (a, b) => {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false
        }
        for (const i in a) {
            if (a[i] != b[i]) {
                return false
            }
        }
        return true
    }

    if (typeof(a) === 'object') {
        if (typeof(b) !== 'object') {
            return false
        }
        const aKeys = Object.keys(a)
        const bKeys = Object.keys(b)
        if (aKeys.length !== bKeys.length) {
            return false
        }
        for (const i in aKeys) {
            if (a[aKeys[i]] != b[aKeys[i]]) {
                return false
            }
        }
        return true
    }

    return a == b
}
