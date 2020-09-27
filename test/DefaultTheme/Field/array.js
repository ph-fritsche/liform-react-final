import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testLifield } from './_field'

it('Render input fields for array elements', () => {
    const { input } = testLifield({
        value: ['a', 'b'],
        schema: {
            type: 'array',
            items: { type: 'string' },
        },
        meta: {
            errors: {
                '': ['Some error.'],
            },
        },
    })

    expect(input).toHaveFormValues({ 'form[0]': 'a', 'form[1]': 'b' })
    expect(input).toHaveTextContent('Some error.')
})

it('Render array without value and errors', () => {
    testLifield({
        schema: {
            title: 'foo field',
            type: 'array',
            items: {
                type: 'string',
            },
        },
    })

    expect(true).toBeTruthy()
})

it('Render array with different item types', () => {
    const { input } = testLifield({
        schema: {
            title: 'foo field',
            type: 'array',
            items: [
                { type: 'boolean' },
                { type: 'number' },
            ],
            additionalItems: { type: 'string' },
        },
        value: [true, 123, 'bar'],
    })

    const inputs = input.querySelectorAll('input')

    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveAttribute('name', 'form[0]')
    expect(inputs[0]).toBeChecked()
    expect(inputs[1]).toHaveAttribute('name', 'form[1]')
    expect(inputs[1]).toHaveValue(123)
    expect(inputs[2]).toHaveAttribute('name', 'form[2]')
    expect(inputs[2]).toHaveValue('bar')
})

it('Add and remove extra array elements', () => {
    const { input } = testLifield({
        value: ['a', 'b'],
        schema: {
            type: 'array',
            title: 'foo field',
            items: { type: 'string' },
            allowAdd: true,
        },
    })

    expect(screen.queryAllByRole('button', { name: /remove/i })).toHaveLength(0)

    userEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    userEvent.type(screen.getAllByRole('textbox')[2], 'c')

    expect(input).toHaveFormValues({ 'form[0]': 'a', 'form[1]': 'b', 'form[2]': 'c' })

    userEvent.click(screen.getByRole('button', { name: /remove/i }))

    expect(input).toHaveFormValues({ 'form[0]': 'a', 'form[1]': 'b' })
})

it('Remove and add existing array elements', () => {
    const { input } = testLifield({
        value: ['a', 'b'],
        schema: {
            type: 'array',
            title: 'foo field',
            items: { type: 'string' },
            allowDelete: true,
        },
    })

    expect(screen.queryAllByRole('button', { name: /add/i })).toHaveLength(0)

    userEvent.click(screen.getAllByRole('button', { name: /remove/i })[1])

    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(input).toHaveFormValues({ 'form[0]': 'a' })

    userEvent.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    expect(input).toHaveFormValues({ 'form[0]': 'a', 'form[1]': '' })
})
