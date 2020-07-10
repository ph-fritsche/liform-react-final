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

    it('Validate root type', () => {
        const schema = {type: 'string'}
        const validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: 'foo'})).toEqual(undefined)
        expect(validator({_: 123})).toEqual({'': ['Type']})
    })

    it('Validate required property', () => {
        const schema = {type: 'object', properties: {'foo': true}, required: ['foo']}
        const validator = buildFlatAjvValidate(undefined, schema)

        expect(validator({_: {'foo': 'bar'}})).toEqual(undefined)
        expect(validator({_: {'bar': 'baz'}})).toEqual({'foo': ['Required']})
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
            expect(f).toBeCalledWith(values)
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
    })
})
