import React from 'react'
import { render, queries } from '@testing-library/react'
import { buildQueries, queryAllByLabelText, queryAllByText } from '@testing-library/react'
import { DefaultTheme, Liform, Lifield, htmlizeName } from '../../../src'

const [, , getbyL, , ] = buildQueries(
    (container, text, options) => {
        const input = queryAllByLabelText(container, text, options)
        const legend = queryAllByText(container, text, { ...options, selector: 'legend' })
        const fieldset = legend.map(e => e.closest('fieldset')).filter(e => e !== null)

        return input.concat(fieldset)
    },
    (container, text) => `Found multiple elements for label/legend "${text}"`,
    (container, text) => `Unable to find an input for label or fieldset for legend "${text}"`,
)

export function renderLifield(props) {
    let liformValue
    const ContainerComponent = renderProps => {
        liformValue = renderProps.form.getState().values._
        return <form id="container">{renderProps.children}</form>
    }
    const FormComponent = props => (
        <Liform
            theme={DefaultTheme}
            name="form"
            render={{ container: ContainerComponent }}
            {...props}
        >
            { ({ liform }) => <Lifield schema={liform.schema} />}
        </Liform>
    )

    const result = render(FormComponent(props), {
        queries: {
            ...queries,
            getbyL,
        },
    })

    const { container, rerender } = result
    const form = container.querySelector('form#container')

    return {
        ...result,
        rerender: newProps => rerender(FormComponent(newProps)),
        form,
        element: form.firstChild,
        elements: form.children,
        expectedFormValues: expectedFormValues(props.value, props.name || 'form'),
        getActiveElement: () => container.ownerDocument.activeElement,
        getLiformValue: () => liformValue,
    }
}

function expectedFormValues(value, rootName) {
    const expected = {}

    function traverseValue(value, path = ['_']) {
        if (typeof (value) === 'object') {
            if (Array.isArray(value)) {
                value.forEach((v, i) => traverseValue(v, [].concat(path, [i])))
            } else {
                for (const k in value) {
                    traverseValue(value[k], [].concat(path, k))
                }
            }
        } else {
            expected[htmlizeName(path.join('.'), rootName)] = value
        }
    }
    value !== undefined && traverseValue(value)

    return expected
}

export function testLifield({
    schema: {
        title = 'foo field',
        ...schemaRest
    },
    ...others
} = {}) {
    const rendered = renderLifield({
        schema: {
            title,
            ...schemaRest,
        },
        ...others,
    })
    const { form, expectedFormValues, getbyL } = rendered

    expect(form).toContainFormValues(expectedFormValues)

    rendered.input = getbyL(title)

    return rendered
}
