import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testLifield } from './_field'

it('Render and change select', () => {
    const { element, input } = testLifield({
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
    })

    expect(input).toHaveProperty('tagName', 'SELECT')
    expect(input).toHaveValue('foo')
    expect(element).toHaveTextContent('Some error.')

    userEvent.selectOptions(input, 'bar')

    expect(input).toHaveValue('bar')

    userEvent.selectOptions(input, 'baz')

    expect(input).toHaveValue('baz')
})

it('Render and change expanded', () => {
    const { element } = testLifield({
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
    })

    expect(element).toHaveTextContent('Some error.')
    expect(element).toHaveFormValues({ 'form': 'foo' })

    userEvent.click(screen.getByLabelText('barTitle'))

    expect(element).toHaveFormValues({ 'form': 'bar' })
})

it('Render and change multiple select', () => {
    const { element, input } = testLifield({
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
    })

    expect(input).toHaveProperty('tagName', 'SELECT')
    expect(input).toHaveValue(['foo'])
    expect(element).toHaveTextContent('Some error.')

    userEvent.selectOptions(input, ['baz'])

    expect(input).toHaveValue(['foo', 'baz'])

    userEvent.click(document.body)

    expect(input).toHaveValue(['foo', 'baz'])
})

it('Render and change multiple expanded', () => {
    const { input } = testLifield({
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
    })

    expect(input).toHaveTextContent('Some error.')

    const checkFoo = screen.getByLabelText('fooTitle')
    expect(checkFoo).toHaveAttribute('name', 'form[]')
    // eslint-disable-next-line jest-dom/prefer-to-have-value -- Here we do want to test that the value attribute is set correctly
    expect(checkFoo).toHaveAttribute('value', 'foo')
    expect(checkFoo).toBeChecked()

    const checkBar = screen.getByLabelText('barTitle')
    expect(checkBar).toHaveAttribute('name', 'form[]')
    // eslint-disable-next-line jest-dom/prefer-to-have-value -- Here we do want to test that the value attribute is set correctly
    expect(checkBar).toHaveAttribute('value', 'bar')
    expect(checkBar).not.toBeChecked()

    userEvent.click(checkBar)

    expect(checkBar).toBeChecked()

    userEvent.click(checkFoo)

    expect(checkFoo).not.toBeChecked()
})
