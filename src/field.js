import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Field as FinalField } from 'react-final-form';
import { FieldProps as FinalFieldProps, FieldRenderProps as FinalFieldRenderProps } from 'react-final-form';
import { buildFieldValidator } from './validate';
import { LiformContext, LiformContextProp } from './form';
import { SchemaProp } from './schema';
import { isShallowEqual } from 'liform-util'

export const liformizeName = (finalName) => {
    return finalName
        .replace(/\[/g, '.')
        .replace(/\]/g, '')
        .replace(/^_\.?/, '')
}

export const finalizeName = (liformName) => {
    if (liformName === undefined || liformName === '') {
        return '_'
    }
    return '_.' + liformName
}

export const htmlizeName = (finalName, rootName) => {
    let i = 0
    return (finalName.replace(/^_(\.|$)/, (m, d) => rootName ? rootName + d : '')
        .replace(/[.[]/g, () => { i++; return i>1 ? '][' : '[' })
        + ( i>0 ? ']' : '')
    ).replace(/]]+/, ']')
}

export const guessWidget = (fieldSchema, theme) => {
    fieldSchema = fieldSchema ?? true
    let guesses = []

    if (fieldSchema.widget) {
        for (const propGuess of Array.isArray(fieldSchema.widget)? fieldSchema.widget : [fieldSchema.widget]) {
            if (theme.field[propGuess]) {
                return propGuess
            }
            guesses.push(propGuess)
        }
    }

    let typeGuess
    if (Object.prototype.hasOwnProperty.call(fieldSchema, 'enum')) {
        typeGuess = 'choice'
    } else if (Object.prototype.hasOwnProperty.call(fieldSchema, 'oneOf')) {
        typeGuess = 'oneOf'
    } else if (theme.field[fieldSchema.format]) {
        typeGuess = fieldSchema.format
    } else {
        typeGuess = fieldSchema.type || null
    }
    if (guesses.indexOf(typeGuess) < 0) {
        guesses.push(typeGuess)
    }

    if (!theme.field[typeGuess]) {
        throw new Error('Liform: No widget defined for ' + guesses.map(v => v === null ? '(null)' : v) + '\n' + JSON.stringify(fieldSchema))
    }

    return typeGuess
};

const compileFinalFieldProps = (liform, props) => {
    return {
        afterSubmit: props.afterSubmit,
        allowNull: props.allowNull,
        beforeSubmit: props.beforeSubmit,
        data: props.data,
        defaultValue: props.defaultValue,
        format: props.format,
        formatOnBlur: props.formatOnBlur,
        initialValue: props.initialValue,
        isEqual: props.isEqual,
        name: finalizeName(props.name),
        parse: props.parse,
        ref: props.ref,
        subscription: props.subscription,
        validate: props.validate || buildFieldValidator(liform, props.name),
        validateFields: props.validateFields,
        value: props.value,
    }
}

export const renderField = props => {
    const {
        liform,
        schema = true,
        Widget = liform.theme.field[guessWidget(schema, liform.theme)],
        ...others
    } = props

    if (typeof(Widget) === 'function') {
        return React.createElement(Widget, {
            liform,
            schema,
            ...others,
        })
    } else if (typeof(Widget) !== 'object') {
        throw new Error('Field widgets must be functions or objects, got ' + JSON.stringify(Widget))
    }

    const {render, component, ...rest} = Widget
    const fieldProps = { ...others, liform, schema, ...compileFinalFieldProps(liform, others), ...rest }
    if (render || component) {
        fieldProps.render = renderFinalField.bind(undefined, render || component)
    } else if (!props.children) {
        throw new Error('Field widgets without render/component require props.children')
    }

    return React.createElement(FinalField, fieldProps)
}

renderField.propTypes = {
    ...FinalFieldProps,

    liform: LiformContextProp,
    schema: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    Widget: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.element, PropTypes.arrayOf(PropTypes.element), PropTypes.oneOf([null])]),
}

export const renderFinalField = (element, props) => {
    return <LifieldChildren
        render={element}
        {...props}
    />
}

const LifieldChildren = React.memo(
    function LifieldChildren ({render, input: {name, ...input}, meta: {...meta}, liform, schema, ...rest}) {
        input.name = htmlizeName(name, liform.rootName)

        // if a value does not exist, final form provides an empty string
        if (schema && schema.type && input.value === '') {
            if (schema.type === 'array') {
                input.value = []
            } else if (schema.type === 'object') {
                input.value = {}
            } else if (schema.type !== 'string') {
                input.value = undefined
            }
        }

        const liformName = liformizeName(name)

        meta.error = (meta.touched || meta.dirty) && liform.validationErrors && liform.validationErrors[liformName]
            || meta.pristine && liform.meta.errors && liform.meta.errors[liformName]

        const placeholder = rest.placeholder || schema.placeholder || schema.attr && schema.attr.placeholder

        return React.createElement(render, {...rest, name, schema, input, meta, placeholder})
    },
    (
        {input: prevInput, meta: {error: prevError, ...prevMeta}, ...prevRest},
        {input: nextInput, meta: {error: nextError, ...nextMeta}, ...nextRest},
    ) => {
        return isShallowEqual(prevRest, nextRest)
            && isShallowEqual(prevInput, nextInput)
            && isShallowEqual(prevMeta, nextMeta)
            && isShallowEqual(prevError, nextError)
    }
)

LifieldChildren.propTypes = {
    render: PropTypes.elementType,

    liform: LiformContextProp.isRequired,

    schema: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),

    input: PropTypes.shape({
        name: PropTypes.string.isRequired,
    }).isRequired,
    meta: PropTypes.object.isRequired,
}

export const FieldRenderProps = {
    ...FinalFieldRenderProps,

    schema: SchemaProp,
    name: PropTypes.string,
}

export function Lifield (props) {
    const {
        liform: liformProp,
        render: renderProp,
    } = props

    const liformContext = useContext(LiformContext)
    const liform = liformProp || liformContext

    const render = renderProp || liform.render.field || renderField

    return React.createElement(
        LifieldRender,
        {...props, render, liform}
    )
}

Lifield.propTypes = {
    liform: LiformContextProp,
    render: PropTypes.elementType,
}

const LifieldRender = React.memo(function Lifield({render, ...rest}) { return render(rest)})

LifieldRender.propTypes = {
    render: PropTypes.func,
}
