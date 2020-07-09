import React from 'react';
import { Field as FinalField } from "react-final-form";
import { buildFieldValidator } from './validate';

export const liformizeName = (finalName) => {
    return finalName.replace(/^_\.?/, '')
}

export const finalizeName = (liformName) => {
    if (liformName === undefined || liformName === "") {
        return '_'
    }
    return '_.' + liformName
}

export const htmlizeName = (finalName, rootName) => {
    let i = 0
    return (finalName.replace(/^_/, rootName)
        .replace(/[.[]/g, () => { i++; return i>1 ? '][' : '[' })
        + ( i>0 ? ']' : '')
    ).replace(/]]+/, ']')
}

export const guessWidget = (fieldSchema, theme) => {
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
    if (fieldSchema.hasOwnProperty('enum')) {
        typeGuess = 'choice'
    } else if (fieldSchema.hasOwnProperty('oneOf')) {
        typeGuess = 'oneOf'
    } else if (theme.field[fieldSchema.format]) {
        typeGuess = fieldSchema.format
    } else {
        typeGuess = fieldSchema.type || null
    }
    if (typeGuess && guesses.indexOf(typeGuess) < 0) {
        guesses.push(typeGuess)
    }

    if (!typeGuess || !theme.field[typeGuess]) {
        throw new Error('Liform: No widget defined for ' + guesses + '\n' + JSON.stringify(fieldSchema))
    }

    return typeGuess
};

export const compileFinalFieldProps = (props) => {
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
        validate: props.validate || buildFieldValidator(props.liform, props.name),
        validateFields: props.validateFields,
        value: props.value,

        placeholder: props.schema.placeholder || props.schema.attr && props.schema.attr.placeholder,
    }
}

export const renderField = (props) => {
    const theme = props.theme || props.liform.theme
    const Widget = props.widget || theme.field[guessWidget(props.schema, theme)]

    if (Widget instanceof Function) {
        return <Widget {...props}/>
    }

    let fieldProps = compileFinalFieldProps(props)

    if (typeof(Widget) === 'string') {
        fieldProps = { key: props.key, ...fieldProps, component: Widget }
    } else if (typeof(Widget) === 'object') {
        const {render, component, ...rest} = Widget
        fieldProps = { ...props, ...fieldProps, ...rest, render: renderFinalField.bind(undefined, render || component) }
    }

    return React.createElement(FinalField, fieldProps)
}

export const renderFinalField = (element, props) => {
    return <LifieldChildren
        render={element}
        {...props}
    />
}

export const LifieldChildren = React.memo(
    ({render, input: {name, ...input}, meta, ...rest}) => {
        input.name = htmlizeName(name, rest.liform.rootName)

        // if a value does not exist, final form provides an empty string
        if (rest.schema && rest.schema.type && input.value === '') {
            if (rest.schema.type === 'array') {
                input.value = []
            } else if (rest.schema.type === 'object') {
                input.value = {}
            } else if (rest.schema.type !== 'string') {
                input.value = undefined
            }
        }

        return React.createElement(render, {...rest, name, input, meta})
    },
    (
        {input: prevInput, meta: {prevMeta, error: prevError}, ...prevRest},
        {input: nextInput, meta: {nextMeta, error: nextError}, ...nextRest},
    ) => {
        return shallowEqual(prevRest, nextRest)
            && shallowEqual(prevInput, nextInput)
            && shallowEqual(prevMeta, nextMeta)
            && shallowEqual(prevError, nextError)
    }
)

const shallowEqual = (a, b) => {
    if (typeof(a) !== typeof(b) || Array.isArray(a) !== Array.isArray(b)) {
        return false
    }

    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            return false
        }
        for (var i in a) {
            if (a[i] !== b[i]) {
                return false
            }
        }
    } else if (typeof(a) === 'object') {
        if (!shallowEqual(Object.keys(a), Object.keys(b))) {
            return false
        }
        for (var i in a) {
            if (a[i] !== b[i]) {
                return false
            }
        }
    } else if (a !== b) {
        return false
    }
    return true
}

export class Lifield extends React.PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        const { render, ...rest } = this.props

        return (render || this.props.liform.render.field)(rest)
    }
}
