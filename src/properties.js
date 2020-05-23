export const sortPropertyKeys = (properties) => {
    return Object.keys(properties).sort((keyA, keyB) => {
        const posA = properties[keyA].propertyOrder || 1000
        const posB = properties[keyB].propertyOrder || 1000
        return posA === posB ? 0 : posA < posB ? -1 : 1
    })
}

export const sortProperties = (properties) => {
    const object = {}
    sortPropertyKeys(properties).forEach(key => {
        object[key] = properties[key]
    })
    return object
}

export const mapProperties = (properties, callback) => {
    return sortPropertyKeys(properties).map(key => callback(properties[key], key))
}
