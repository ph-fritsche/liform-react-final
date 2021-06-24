import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Liform, DefaultTheme, Lifield } from '../../src'

const TestField = (name, render) => {
    const widget = { render }
    return function TestField() {
        return <Lifield name={name} Widget={widget}/>
    }
}

it('Form section calls render.field with schema root', () => {
    const renderFn = jest.fn(() => <div data-testid="field"></div>)
    const schema = {foo: 'bar'}
    render(
        <Liform
            theme={DefaultTheme}
            sections={{
                form: DefaultTheme.sections.form,
            }}
            render={{
                field: renderFn,
            }}
            schema={schema}
        />,
    )

    expect(renderFn).toBeCalled()
    expect(renderFn.mock.calls[0][0]).toHaveProperty('schema', schema)

    expect(screen.getByTestId('field')).toBeInTheDocument()
})

it('Render errors for unregistered field', () => {
    const rendered = render(
        <Liform
            theme={DefaultTheme}
            meta={{
                errors: {
                    'bar': ['There is something wrong with bar.'],
                    'baz': ['There is something wrong with baz.'],
                },
            }}
            sections={{
                field: TestField('bar', () => 'This is bar.'),
                errors: DefaultTheme.sections.errors,
            }}
        />,
    )

    expect(rendered.getByText('This is bar.')).toBeInTheDocument()
    expect(rendered.getByText('There is something wrong with baz.')).toBeInTheDocument()
    expect(rendered.queryByText('There is something wrong with bar.')).not.toBeInTheDocument()
})

it('Action section contains reset button', () => {
    const rendered = render(
        <Liform
            theme={DefaultTheme}
            sections={{
                field: TestField('bar', ({input, meta: {dirty}}) => <label className={dirty ? 'dirty': 'pristine'}>TestField<input {...input}/></label>),
                action: DefaultTheme.sections.action,
            }}
            value={{
                bar: 'someValue',
            }}
        />,
    )

    const field = rendered.getByLabelText('TestField')

    userEvent.clear(field)
    userEvent.type(field, 'anotherValue', {delay: 0})

    expect(field).toHaveValue('anotherValue')
    expect(field.parentElement).toHaveClass('dirty')

    userEvent.click(rendered.getByRole('button', {name: /reset/i}))

    expect(field).toHaveValue('someValue')
    expect(field.parentElement).toHaveClass('pristine')
})

it('Action section contains submit button', () => {
    const rendered = render(
        <Liform
            theme={DefaultTheme}
            sections={{
                field: TestField('bar', ({input, meta: {dirty}}) => <label className={dirty ? 'dirty': 'pristine'}>TestField<input {...input}/></label>),
                action: DefaultTheme.sections.action,
            }}
            value={{
                bar: 'someValue',
            }}
            buildSubmitHandler={({updateData}) => ((values) => { updateData({value: values._}) })}
        />,
    )

    const field = rendered.getByLabelText('TestField')

    userEvent.clear(field)
    userEvent.type(field, 'anotherValue')

    expect(field).toHaveValue('anotherValue')
    expect(field.parentElement).toHaveClass('dirty')

    userEvent.click(rendered.getByRole('button', {name: /submit/i}))

    expect(field).toHaveValue('anotherValue')
    expect(field.parentElement).toHaveClass('pristine')
})
