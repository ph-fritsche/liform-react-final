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

        expect(input).toHaveAttribute('name', 'foo')
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

        expect(input).toHaveAttribute('name', 'foo')
        expect(input).toHaveValue('bar')
        expect(field).toHaveTextContent('Some error.')

        userEvent.clear(input)
        userEvent.type(input, 'baz')

        expect(input).toHaveValue('baz')
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Render and change string input with pattern', () => {
        const rendered = render(TestLiform({
            schema: {type: 'string', title: 'foo field', pattern: '^abc$'},
            value: 'a',
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(field).not.toHaveTextContent('Pattern')
        expect(input).toHaveAttribute('pattern', '^abc$')

        userEvent.type(input, 'b')

        expect(field).toHaveTextContent('Pattern')

        userEvent.type(input, 'c')

        expect(input).toHaveValue('abc')

        expect(field).not.toHaveTextContent('Pattern')
    })

    it('Render and change number input', () => {
        const rendered = render(TestLiform({
            schema: {type: 'number', title: 'foo field'},
            value: 123,
            meta: {errors: {'': ['Some error.']}},
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input).toHaveAttribute('name', 'foo')
        expect(input).toHaveAttribute('type', 'number')
        expect(input).toHaveValue(123)
        expect(field).toHaveTextContent('Some error.')

        userEvent.clear(input)
        userEvent.click(rendered.container)

        expect(input).toHaveValue(null)

        userEvent.type(input, '456')

        expect(input).toHaveValue(456)
        expect(field).not.toHaveTextContent('Some error.')
    })

    it('Round number input on blur', () => {
        const rendered = render(TestLiform({
            schema: {type: 'number', title: 'foo field', step: 0.02},
            value: 123,
        }))

        const input = rendered.getByLabelText('foo field')

        expect(input).toHaveValue(123)

        userEvent.clear(input)
        userEvent.type(input, '456.777')
        // fireEvent.change(input, {target: {value: 456.7}})
        // fireEvent.change(input, {target: {value: 456.77}})
        // fireEvent.change(input, {target: {value: 456.777}})

        expect(input).toHaveValue(456.777)

        userEvent.click(rendered.container)

        expect(input).toHaveValue(456.78)
    })

    it('Render and change integer input', () => {
        const rendered = render(TestLiform({
            schema: {type: 'integer', title: 'foo field'},
            value: 123,
            meta: {errors: {'': ['Some error.']}},
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input).toHaveAttribute('name', 'foo')
        expect(input).toHaveAttribute('type', 'number')
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

    it('Render array with different item types', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'array',
                items: [
                    {type: 'boolean'},
                    {type: 'number'},
                ],
                additionalItems: {type: 'string'},
            },
            value: [true, 123, 'bar'],
        }))

        expect(rendered.getByText('foo field')).toBeTruthy()

        const inputs = rendered.container.querySelectorAll('input')

        expect(inputs).toHaveLength(3)
        expect(inputs[0]).toHaveAttribute('name', 'foo[0]')
        expect(inputs[0]).toBeChecked()
        expect(inputs[1]).toHaveAttribute('name', 'foo[1]')
        expect(inputs[1]).toHaveValue(123)
        expect(inputs[2]).toHaveAttribute('name', 'foo[2]')
        expect(inputs[2]).toHaveValue('bar')
    })

    it('Add and remove extra array elements', () => {
        const rendered = render(TestLiform({
            value: ['a', 'b'],
            schema: {
                type: 'array',
                title: 'foo field',
                items: {type: 'string'},
                allowAdd: true,
            },
        }))

        const fieldset = rendered.getByText('foo field', {selector: 'legend'}).closest('fieldset')

        expect(rendered.queryAllByRole('button', {name: /remove/i})).toHaveLength(0)

        userEvent.click(rendered.getByRole('button', {name: /add/i}))

        expect(rendered.getAllByRole('textbox')).toHaveLength(3)
        userEvent.type(rendered.getAllByRole('textbox')[2], 'c')

        expect(fieldset).toHaveFormValues({'foo[0]': 'a', 'foo[1]': 'b', 'foo[2]': 'c'})

        userEvent.click(rendered.getByRole('button', {name: /remove/i}))

        expect(fieldset).toHaveFormValues({'foo[0]': 'a', 'foo[1]': 'b'})
    })

    it('Remove and add existing array elements', () => {
        const rendered = render(TestLiform({
            value: ['a', 'b'],
            schema: {
                type: 'array',
                title: 'foo field',
                items: {type: 'string'},
                allowDelete: true,
            },
        }))

        const fieldset = rendered.getByText('foo field', {selector: 'legend'}).closest('fieldset')

        expect(rendered.queryAllByRole('button', {name: /add/i})).toHaveLength(0)

        userEvent.click(rendered.getAllByRole('button', {name: /remove/i})[1])

        expect(rendered.getAllByRole('textbox')).toHaveLength(1)
        expect(fieldset).toHaveFormValues({'foo[0]': 'a'})

        userEvent.click(rendered.getByRole('button', {name: /add/i}))

        expect(rendered.getAllByRole('textbox')).toHaveLength(2)
        expect(fieldset).toHaveFormValues({'foo[0]': 'a', 'foo[1]': ''})
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
                },
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
    it('Render button', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                widget: 'button',
            },
        }))

        expect(rendered.getByRole('button')).toBeTruthy()
    })

    it('Render and change color input', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                widget: 'color',
            },
            meta: {
                errors: {
                    '': ['Some error.'],
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
                    '': ['Some error.'],
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
                    '': ['Some error.'],
                },
            },
            value: 'bar',
        }))

        const field = rendered.getByText('foo field').closest('div')

        expect(field).toHaveTextContent('Some error.')
    })
})

describe('Choice', () => {
    it('Render and change select', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'string',
                widget: 'choice',
                enum: ['foo', 'bar', 'baz'],
                enumTitles: ['fooTitle', 'barTitle', 'bazTitle'],
            },
            meta: {
                errors: {
                    '': ['Some error.'],
                },
            },
            value: 'foo',
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input).toHaveAttribute('name', 'foo')
        expect(input.tagName).toEqual('SELECT')
        expect(input).toHaveValue('foo')
        expect(field).toHaveTextContent('Some error.')

        userEvent.selectOptions(input, 'bar')

        expect(input).toHaveValue('bar')

        userEvent.selectOptions(input, 'baz')

        expect(input).toHaveValue('baz')
    })

    it('Render and change expanded', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'string',
                widget: 'choice',
                choiceExpanded: true,
                enum: ['foo', 'bar', 'baz'],
                enumTitles: ['fooTitle', 'barTitle', 'bazTitle'],
            },
            meta: {
                errors: {
                    '': ['Some error.'],
                },
            },
            value: 'foo',
        }))

        const field = rendered.getByText('foo field', {selector: 'legend'}).closest('fieldset')
        expect(field).toHaveTextContent('Some error.')
        expect(field).toHaveFormValues({'foo': 'foo'})

        userEvent.click(rendered.getByLabelText('barTitle'))

        expect(field).toHaveFormValues({'foo': 'bar'})
    })

    it('Render and change multiple select', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'array',
                widget: 'choice',
                enum: ['foo', 'bar', 'baz'],
                enumTitles: ['fooTitle', 'barTitle', 'bazTitle'],
            },
            meta: {
                errors: {
                    '': ['Some error.'],
                },
            },
            value: ['foo'],
        }))

        const input = rendered.getByLabelText('foo field')
        const field = input.closest('div')

        expect(input).toHaveAttribute('name', 'foo')
        expect(input.tagName).toEqual('SELECT')
        expect(input).toHaveValue(['foo'])
        expect(field).toHaveTextContent('Some error.')

        userEvent.selectOptions(input, ['baz'])

        expect(input).toHaveValue(['foo', 'baz'])

        userEvent.click(rendered.container)

        expect(input).toHaveValue(['foo', 'baz'])
    })

    it('Render and change multiple expanded', () => {
        const rendered = render(TestLiform({
            schema: {
                title: 'foo field',
                type: 'array',
                widget: 'choice',
                choiceExpanded: true,
                enum: ['foo', 'bar', 'baz'],
                enumTitles: ['fooTitle', 'barTitle', 'bazTitle'],
            },
            meta: {
                errors: {
                    '': ['Some error.'],
                },
            },
            value: ['foo'],
        }))

        const field = rendered.getByText('foo field', {selector: 'legend'}).closest('fieldset')
        expect(field).toHaveTextContent('Some error.')

        const checkFoo = rendered.getByLabelText('fooTitle')
        expect(checkFoo).toHaveAttribute('name', 'foo[]')
        expect(checkFoo).toHaveAttribute('value', 'foo')
        expect(checkFoo).toBeChecked()

        const checkBar = rendered.getByLabelText('barTitle')
        expect(checkBar).toHaveAttribute('name', 'foo[]')
        expect(checkBar).toHaveAttribute('value', 'bar')
        expect(checkBar).not.toBeChecked()

        userEvent.click(checkBar)

        expect(checkBar).toBeChecked()

        userEvent.click(checkFoo)

        expect(checkFoo).not.toBeChecked()
    })
})
