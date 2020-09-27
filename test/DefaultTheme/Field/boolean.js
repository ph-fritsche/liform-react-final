import userEvent from '@testing-library/user-event'
import { testLifield } from './_field'

it('Render and change boolean input', () => {
    const { element, input } = testLifield({
        schema: {
            type: 'boolean',
        },
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
    })

    expect(input).not.toBeChecked()
    expect(element).toHaveTextContent('Some error.')

    userEvent.click(input)

    expect(input).toBeChecked()
    expect(element).not.toHaveTextContent('Some error.')
})
