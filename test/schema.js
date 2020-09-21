import PropTypes from 'prop-types'
import { compileSchema, SchemaProp } from '../src/schema';

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

describe('SchemaProp', () => {
    it.each([
        [{title: false}],
        [{description: []}],
        [{items: ['foo']}],
        [{additionalItems: 'foo'}],
    ])('Returns error on invalid schema', (schema) => {
        const realError = console.error
        console.error = (e) => { throw new Error(e) }

        expect(() => PropTypes.checkPropTypes({foo: SchemaProp}, {foo: schema}, 'foo', 'FooComponent')).toThrowError()

        PropTypes.resetWarningCache()
        console.error = realError
    })

    it.each([
        [{title: 'foo'}],
        [{description: 'foo'}],
        [{items: [true, {type: 'string'}]}],
        [{additionalItems: {type: 'number'}}],
    ])('Accepts valid schema', (schema) => {
        const realError = console.error
        console.error = (e) => { throw new Error(e) }

        expect(() => PropTypes.checkPropTypes({ foo: SchemaProp }, { foo: schema }, 'foo', 'FooComponent')).not.toThrowError()

        PropTypes.resetWarningCache()
        console.error = realError
    })
})
