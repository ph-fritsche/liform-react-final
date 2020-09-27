import { testLifield } from './_field'

it('Render input fields for object properties', () => {
    const { input } = testLifield({
        value: { a: 'bar', b: 'baz' },
        schema: {
            title: 'foo field',
            type: 'object',
            properties: {
                a: { type: 'string' },
                b: { type: 'string' },
            },
        },
        meta: { errors: { '': ['Some error.'] } },
    })

    expect(input).toHaveFormValues({ 'form[a]': 'bar', 'form[b]': 'baz' })
    expect(input).toHaveTextContent('Some error.')
})

it('Render object without value and errors', () => {
    testLifield({
        schema: {
            title: 'foo field',
            type: 'object',
            properties: {
                a: { type: 'string' },
                b: { type: 'string' },
            },
        },
    })

    expect(true).toBeTruthy()
})
