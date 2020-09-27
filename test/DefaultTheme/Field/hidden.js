import { screen } from '@testing-library/react'
import { renderLifield } from './_field'

it('Render and change hidden input', () => {
    const { form, rerender } = renderLifield({
        schema: {
            title: 'foo field',
            widget: 'hidden',
        },
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
        value: 'bar',
    })

    expect(form).toEqualFormValues({ form: 'bar' })

    rerender({
        key: '123',
        schema: {
            title: 'foo field',
            widget: 'hidden',
        },
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
        value: 'bar',
    })

    const field = screen.getByText('foo field').closest('div')

    expect(field).toHaveTextContent('Some error.')
})
