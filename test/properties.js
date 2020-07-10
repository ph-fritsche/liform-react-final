import { sortPropertyKeys, sortProperties, mapProperties } from '../src/properties'

describe('Property helpers', () => {
    it('Sort keys', () => {
        const object = {
            a: {propertyOrder: 2},
            b: {propertyOrder: 1},
            c: {}, // json-schema defines 1000 as default
            d: {propertyOrder: 2000},
            e: {propertyOrder: 1},
        }

        expect(sortPropertyKeys(object)).toEqual(['b','e','a','c','d'])
    })

    it('Sort properties', () => {
        const object = {
            a: {propertyOrder: 2},
            b: {propertyOrder: 1},
            c: {propertyOrder: 1},
        }

        const sortedObject = sortProperties(object)
        expect(Object.keys(sortedObject)).toEqual(['b','c','a'])
        expect(sortedObject).toEqual(object)
    })

    it('Map properties', () => {
        const object = {
            a: {v: 'foo', propertyOrder: 2},
            b: {v: 'bar', propertyOrder: 1},
            c: {v: 'baz', propertyOrder: 1},
        }

        expect(mapProperties(object, (a,i) => i + ':' + a.v)).toEqual(['b:bar','c:baz','a:foo'])
    })
})
