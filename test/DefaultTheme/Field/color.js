import { fireEvent } from '@testing-library/react'
import { testLifield } from './_field'

it('Render and change color input', () => {
    const { element, input } = testLifield({
        schema: {
            title: 'foo field',
            widget: 'color',
        },
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
    })

    expect(input).toHaveValue('#000000')
    expect(element).toHaveTextContent('Some error.')

    fireEvent.change(input, { target: { value: '#ffffff' } })

    expect(input).toHaveValue('#ffffff')
    expect(element).not.toHaveTextContent('Some error.')
})
