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
    const container = renderProps => {
        liformValue = renderProps.form.getState().values._
        return <form id="container">{renderProps.children}</form>
    }

    const result = render((
        <Liform
            theme={DefaultTheme}
            name="form"
            render={{ container }}
            {...props}
        >
            { ({ liform }) => <Lifield schema={liform.schema} />}
        </Liform>
    ), {
        queries: {
            ...queries,
            getbyL,
        },
    })

    return {
        result,
        form: result.container.querySelector('form#container'),
        expectedFormValues: expectedFormValues(props.value, props.name || 'form'),
        getActiveElement: () => result.container.ownerDocument.activeElement,
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

export function testLifield(props) {
    const rendered = renderLifield(props)

    expect(rendered.form).toContainFormValues(rendered.expectedFormValues)

    if (props.schema && props.schema.title) {
        rendered.field = rendered.result.getbyL(props.schema.title)
    }

    return rendered
}
