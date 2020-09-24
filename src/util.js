export function liformizeName (finalName) {
    return finalName
        .replace(/\[/g, '.')
        .replace(/\]/g, '')
        .replace(/^_\.?/, '')
}

export function finalizeName (liformName) {
    if (liformName === undefined || liformName === '') {
        return '_'
    }
    return '_.' + liformName
}

export function htmlizeName (finalName, rootName) {
    let i = 0
    return (finalName.replace(/^_(\.|$)/, (m, d) => rootName ? rootName + d : '')
        .replace(/[.[]/g, () => { i++; return i > 1 ? '][' : '[' })
        + (i > 0 ? ']' : '')
    ).replace(/]]+/, ']')
}
