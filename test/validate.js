import Ajv from 'ajv';
import { buildFlatAjvValidate, buildFlatValidatorStack, buildFlatValidatorHandler, buildFieldValidator }  from '../src/validate'
import { FORM_ERROR } from 'final-form';

/*
 * FinalForm requires values to be an object.
 * Therefore the validation and submit handlers have to work around for supporting scalar root.
 *
 * values: { _ : 'foo' }
 * corresponds to
 * errors: { '' : ['Whatever is wrong with foo.'] }
 * and is validated per
 * schema: { type: 'string' }
 */

describe('Ajv', () => {
    it('Everything is valid without a schema', () => {
        const validator = buildFlatAjvValidate()

        expect(validator({any: 'foo'})).toEqual(undefined)
    })

    it('Validate type', () => {
        let schema = {type: 'string'}
        let validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: 'foo'})).toEqual(undefined)
        expect(validator({_: 123})).toEqual({'': ['Type']})

        schema = {type: 'object', properties: {'foo': {type: 'string'}}}
        validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: {foo: 'bar'}})).toEqual(undefined)
        expect(validator({_: {foo: 123}})).toEqual({'foo': ['Type']})

        schema = {type: 'object', properties: {'foo': {type: 'object', properties: {'bar': {type: 'string'}}}}}
        validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: {foo: {bar: 'baz'}}})).toEqual(undefined)
        expect(validator({_: {foo: {bar: 123}}})).toEqual({'foo.bar': ['Type']})
    })

    it('Validate type on array element', () => {
        let schema = {type: 'array', items: {type: 'string'}}
        let validator = buildFlatAjvValidate(undefined, schema)

        // expect(validator({_: ['foo', 123]})).toEqual({'1': ['Type']})

        schema = {type: 'object', properties: {'foo': {type: 'array', items: {type: 'string'}}}}
        validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: {foo: ['foo', 123]}})).toEqual({'foo.1': ['Type']})
    })

    it('Validate required property', () => {
        let schema = {type: 'object', properties: {'foo': true}, required: ['foo']}
        let validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: {'foo': 'foo'}})).toEqual(undefined)
        expect(validator({_: {'bar': 'bar'}})).toEqual({'foo': ['Required']})

        schema = {type: 'object', properties: {'foo': {type: 'object', properties: {'bar': true}, required: ['bar']}}}
        validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: {foo: {bar: 'bar'}}})).toEqual(undefined)
        expect(validator({_: {foo: {baz: 'baz'}}})).toEqual({'foo.bar': ['Required']})
    })

    it('Translate errors', () => {
        const schema = {type: 'object', properties: {'foo': true}, required: ['foo']}
        const translator = () => ({fieldName: 'my.corrected.path', message: 'My translated message'})
        const validator = buildFlatAjvValidate(undefined, schema, translator)

        expect(validator({_: {'bar': 'baz'}})).toEqual({'my.corrected.path': ['My translated message']})
    })

    it('Provide own Ajv instance', () => {
        const customAjv = new Ajv({formats: {'foo': /^[a-c]$/}})
        const schema = {format: 'foo'}
        const validator = buildFlatAjvValidate(customAjv, schema)

        expect(validator({_: 'b'})).toEqual(undefined)
        expect(validator({_: 'd'})).toEqual({'': ['Format']})
    })
})

describe('Flat validator stack', () => {
    it('Call every validator with values', () => {
        const validators = [
            jest.fn(),
            jest.fn(),
            jest.fn(),
        ]
        const stack = buildFlatValidatorStack(...validators)

        const values = {'foo': 'bar'}
        stack(values)

        for(const f of validators) {
            expect(f).toBeCalledWith(values, undefined)
        }
    })

    it('Concat validation errors', () => {
        const stack = buildFlatValidatorStack(
            () => ({'my.field': 'foo'}),
            () => ({'my.field': ['bar', 'baz']}),
        )

        expect(stack()).toEqual({'my.field': ['foo', 'bar', 'baz']})
    })
})

describe('Flat validator handler', () => {
    it('Store errors on liform, return FORM_ERROR', () => {
        const liformContext = {}
        const errors = {'foo': 'bar'}
        const validator = buildFlatValidatorHandler(() => errors, liformContext)

        expect(validator()).toHaveProperty(FORM_ERROR)
        expect(liformContext.validationErrors).toBe(errors)
    })
})

describe('Field validator', () => {
    it('Return string if there are errors on liform', () => {
        const liformContext = {validationErrors: {'foo.bar': ['baz']}}

        expect(buildFieldValidator(liformContext, 'foo.bar')()).toEqual(['baz'])
        expect(buildFieldValidator(liformContext, 'some.other.field')()).toEqual(undefined)

        expect(buildFieldValidator({}, 'foo')()).toEqual(undefined)
    })
})
