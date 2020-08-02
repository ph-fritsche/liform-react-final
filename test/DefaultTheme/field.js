import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Liform, DefaultTheme } from '../../src'

const TestLiform = props => (
    <Liform
        theme={DefaultTheme}
        name="foo"
        {...props}
    >
        {DefaultTheme.sections.form}
    </Liform>
)

describe('Types', () => {
    it('Render and change boolean input', () => {
        const rendered = render(TestLiform({
            schema: {type: 'boolean', title: 'foo field'},
            meta: {errors: {'': ['Some error.']}},
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input).not.toBeChecked()
        expect(field).toHaveTextContent('Some error.')

        userEvent.click(input)

        expect(input).toBeChecked()
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Render and change string input', () => {
        const rendered = render(TestLiform({
            schema: {type: 'string', title: 'foo field'},
            value: 'bar',
            meta: {errors: {'': ['Some error.']}},
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input).toHaveValue('bar')
        expect(field).toHaveTextContent('Some error.')

        userEvent.clear(input)
        userEvent.type(input, 'baz')

        expect(input).toHaveValue('baz')
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Render and change number input', () => {
        const rendered = render(TestLiform({
            schema: {type: 'number', title: 'foo field'},
            value: 123,
            meta: {errors: {'': ['Some error.']}},
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input.getAttribute('type')).toEqual('number')
        expect(input).toHaveValue(123)
        expect(field).toHaveTextContent('Some error.')

        userEvent.clear(input)
        userEvent.type(input, '456')

        expect(input).toHaveValue(456)
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Render and change integer input', () => {
        const rendered = render(TestLiform({
            schema: {type: 'integer', title: 'foo field'},
            value: 123,
            meta: {errors: {'': ['Some error.']}},
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input.getAttribute('name')).toEqual('foo')
        expect(input.getAttribute('type')).toEqual('number')
        expect(input).toHaveValue(123)
        expect(field).toHaveTextContent('Some error.')

        fireEvent.change(input, {target: {value: '123.5'}})
        fireEvent.blur(input)

        expect(input).toHaveValue(124)
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Render input fields for array elements', () => {
        const rendered = render(TestLiform({
            value: ['a', 'b'],
            schema: {type: 'array', title: 'foo field', items: {type: 'string'}},
            meta: {errors: {'': ['Some error.']}},
        }))

        const fieldset = rendered.getByText('foo field', {selector: 'legend'}).closest('fieldset')

        expect(fieldset).toHaveFormValues({'foo[0]': 'a', 'foo[1]': 'b'})
        expect(fieldset).toHaveTextContent('Some error.')
    })

    it('Render array without value and errors', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        }))

        expect(rendered.getByText('foo field')).toBeTruthy()
    })

    it('Render input fields for object properties', () => {
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
            meta: {errors: {'': ['Some error.']}},
        }))

        const fieldset = rendered.getByText('foo field', {selector: 'legend'}).closest('fieldset')

        expect(fieldset).toHaveFormValues({'foo[a]': 'bar', 'foo[b]': 'baz'})
        expect(fieldset).toHaveTextContent('Some error.')
    })

    it('Render object without value and errors', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'object',
                properties: {
                    a: {type: 'string'},
                    b: {type: 'string'},
                },
            },
        }))

        expect(rendered.getByText('foo field').closest('fieldset')).toHaveFormValues({'foo[a]': '', 'foo[b]': ''})
    })
})

describe('Blocks', () => {
    it('Render and change color input', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                widget: 'color',
            },
            meta: {
                errors: {
                    '': ['Some error.']
                },
            },
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input).toHaveValue('#000000')
        expect(field).toHaveTextContent('Some error.')

        fireEvent.change(input, {target: {value: '#ffffff'}})

        expect(input).toHaveValue('#ffffff')
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Render and change hidden input', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                widget: 'hidden',
            },
            meta: {
                errors: {
                    '': ['Some error.']
                },
            },
            value: 'bar',
        }))

        const form = rendered.container.querySelector('form')

        expect(form).toHaveFormValues({foo: 'bar'})

        rendered.rerender(TestLiform({
            key: '123',
            schema: {
                title: 'foo field',
                widget: 'hidden',
            },
            meta: {
                errors: {
                    '': ['Some error.']
                },
            },
            value: 'bar',
        }))

        const field = rendered.getByText('foo field').closest('div')

        expect(field).toHaveTextContent('Some error.')
    })
})
