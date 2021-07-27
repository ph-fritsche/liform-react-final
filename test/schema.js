import { compileSchema } from '../src/schema';

describe('Compile schema', () => {
    const schema = {
        definitions: {
            nameref: {
                type: 'string',
            },
        },
        title: 'A schema',
        properties: {
            name: {
                $ref: '#/definitions/nameref',
            },
            prop: {
                title: 'A property',
                type: 'string',
            },
            someProp: Object.create({foo: 'bar'}, {type: {enumerable: true, value: 'number'}}),
        },
        required: ['prop'],
    }

    const schemaCompiled = compileSchema(schema, schema);

    test('Clone objects', () => {
        expect(schemaCompiled).toMatchObject({ properties: { prop: schema.properties.prop } })
        expect(schemaCompiled.properties.prop).not.toBe(schema.properties.prop)
    })

    test('Clone arrays', () => {
        expect(schemaCompiled).toMatchObject({ required: schema.required })
        expect(schemaCompiled.required).not.toBe(schema.required)
    })

    test('Resolve $refs', () => {
        expect(schemaCompiled).toMatchObject({ properties: { name: schema.definitions.nameref } })
    })

    test('Ignore prototype properties', () => {
        expect(schemaCompiled.properties.someProp).toEqual({ type: 'number' })
    })
})
