import { compileSchema } from '../src/schema';

describe('Compile schema', () => {
    const schema = {
        definitions: {
            nameref: {
                type: 'string'
            }
        },
        title: 'A schema',
        properties: {
            name: {
                $ref: '#/definitions/nameref'
            },
            prop: {
                title: 'A property',
                type: 'string',
            },
            someProp: Object.create({foo: 'bar'}, {type: {enumerable: true, value: 'number'}}),
        },
        required: ['prop']
    }

    const schemaCompiled = compileSchema(schema);

    test('Copy objects', () => {
        expect(schemaCompiled.properties.prop).toEqual(schema.properties.prop)
        expect(schemaCompiled.properties.prop != schema.properties.prop).toBe(true)
    })

    test('Copy arrays', () => {
        expect(schemaCompiled.required).toEqual(schema.required)
        expect(schemaCompiled.required != schema.required).toBe(true)
    })

    test('Resolve $refs', () => {
        expect(schemaCompiled.properties.name).toHaveProperty('type')
        expect(schemaCompiled.properties.name.type).toEqual('string')
    })

    test('Ignore prototype properties', () => {
        expect(schema.properties.someProp.foo).toBe('bar')
        expect(schemaCompiled.properties.someProp.foo).toBe(undefined)
        expect(schemaCompiled.properties.someProp.type).toBe('number')
    })
})
