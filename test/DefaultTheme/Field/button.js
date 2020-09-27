import { screen } from '@testing-library/react'
import { renderLifield } from './_field'

it('Render button', () => {
    renderLifield({
        schema: {
            title: 'foo field',
            widget: 'button',
        },
    })

    expect(screen.getByRole('button', {name: /foo field/i})).toBeInTheDocument()
})
