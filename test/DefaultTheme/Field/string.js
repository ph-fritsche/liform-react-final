import userEvent from '@testing-library/user-event'
import { testLifield } from './_field'

it('Render and change string input', () => {
    const { element, input } = testLifield({
        schema: {
            type: 'string',
        },
        value: 'bar',
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
    })

    expect(input).toHaveValue('bar')
    expect(element).toHaveTextContent('Some error.')

    userEvent.clear(input)
    userEvent.type(input, 'baz')

    expect(input).toHaveValue('baz')
    expect(element).not.toHaveTextContent('Some error.')
})

it('Render and change string input with pattern', () => {
    const { element, input } = testLifield({
        schema: {
            type: 'string',
            pattern: '^abc$',
        },
        value: 'a',
    })

    expect(element).not.toHaveTextContent('Pattern')
    expect(input).toHaveAttribute('pattern', '^abc$')

    userEvent.type(input, 'b')

    expect(element).toHaveTextContent('Pattern')

    userEvent.type(input, 'c')

    expect(input).toHaveValue('abc')

    expect(element).not.toHaveTextContent('Pattern')
})
