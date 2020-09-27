import userEvent from '@testing-library/user-event'
import { testLifield } from './_field'

it('Render and change number input', () => {
    const { element, input } = testLifield({
        schema: {
            type: 'number',
        },
        value: 123,
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
    })

    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveValue(123)
    expect(element).toHaveTextContent('Some error.')

    userEvent.clear(input)
    userEvent.click(document.body)

    expect(input).toHaveValue(null)

    userEvent.type(input, '456')

    expect(input).toHaveValue(456)
    expect(element).not.toHaveTextContent('Some error.')
})

it('Round number input on blur', () => {
    const { input } = testLifield({
        schema: {
            type: 'number',
            step: 0.02,
        },
        value: 123,
    })

    expect(input).toHaveValue(123)

    userEvent.clear(input)
    userEvent.type(input, '456.777')

    expect(input).toHaveValue(456.777)

    userEvent.click(document.body)

    expect(input).toHaveValue(456.78)
})
