import { fireEvent } from '@testing-library/react'
import { testLifield } from './_field'

it('Render and change integer input', () => {
    const { element, input } = testLifield({
        schema: {
            type: 'integer',
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

    fireEvent.change(input, { target: { value: '123.5' } })
    fireEvent.blur(input)

    expect(input).toHaveValue(124)
    expect(element).not.toHaveTextContent('Some error.')
})
