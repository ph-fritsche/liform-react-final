export function liformizeName(
    finalName: string,
): string {
    return finalName
        .replace(/\[/g, '.')
        .replace(/\]/g, '')
        .replace(/^_\.?/, '')
}

export function finalizeName(
    liformName: string|undefined,
): string {
    return liformName === undefined || liformName === ''
        ? '_'
        : '_.' + liformName
}

export function htmlizeName(
    finalName: string,
    rootName: string,
): string {
    let i = 0
    return (finalName.replace(/^_(\.|$)/, (m, d) => rootName ? rootName + d : '')
        .replace(/[.[]/g, () => { i++; return i > 1 ? '][' : '[' })
        + (i > 0 ? ']' : '')
    ).replace(/]]+/, ']')
}
