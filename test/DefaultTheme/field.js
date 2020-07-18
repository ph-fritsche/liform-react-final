import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Liform, DefaultTheme } from '../../src'

const TestLiform = props => (
    <Liform
        theme={DefaultTheme}
        children={DefaultTheme.sections.form}
        name="foo"
        {...props}
    />
)

describe('Types', () => {
    it('Render and change boolean input', async () => {
        const rendered = render(TestLiform({
            schema: {type: 'boolean', title: 'foo field'},
        }))

        const input = await rendered.findByLabelText('foo field')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input).not.toBeChecked()

        fireEvent.click(input)

        expect(input).toBeChecked()
    })

    it('Render and change string input', async () => {
        const rendered = render(TestLiform({
            schema: {type: 'string', title: 'foo field'},
            value: 'bar',
        }))

        const input = await rendered.findByLabelText('foo field')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input).toHaveValue('bar')

        fireEvent.change(input, {target: {value: 'baz'}})

        expect(input).toHaveValue('baz')
    })

    it('Render and change number input', async () => {
        const rendered = render(TestLiform({
            schema: {type: 'number', title: 'foo field'},
            value: 123,
        }))

        const input = await rendered.findByLabelText('foo field')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input.getAttribute('type')).toEqual('number')
        expect(input).toHaveValue(123)

        fireEvent.change(input, {target: {value: '456'}})

        expect(input).toHaveValue(456)
    })

    it('Render and change integer input', async () => {
        const rendered = render(TestLiform({
            schema: {type: 'integer', title: 'foo field'},
            value: 123,
        }))

        const input = await rendered.findByLabelText('foo field')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input.getAttribute('type')).toEqual('number')
        expect(input).toHaveValue(123)

        fireEvent.change(input, {target: {value: '123.5'}})
        fireEvent.blur(input)

        expect(input).toHaveValue(124)
    })

    it('Render input fields for array elements', async () => {
        const rendered = render(TestLiform({
            value: ['a', 'b'],
            schema: {type: 'array', title: 'foo field', items: {type: 'string'}},
        }))

        const fieldset = (await rendered.findByText('foo field', {selector: 'legend'})).closest('fieldset')

        expect(fieldset).toHaveFormValues({'foo[0]': 'a', 'foo[1]': 'b'})
    })

    it('Render input fields for object properties', async () => {
        const rendered = render(TestLiform({
            value: {a: 'bar', b: 'baz'},
            schema: {
                title: 'foo field',
                type: 'object',
                properties: {
                    a: {type: 'string'},
                    b: {type: 'string'},
                }
            },
        }))

        const fieldset = (await rendered.findByText('foo field', {selector: 'legend'})).closest('fieldset')

        expect(fieldset).toHaveFormValues({'foo[a]': 'bar', 'foo[b]': 'baz'})
    })
})
