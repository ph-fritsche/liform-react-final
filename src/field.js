import React from 'react';
import { Field as FinalField } from "react-final-form";
import { buildFieldValidator } from './validate';

export const htmlizeName = (name, rootName) => {
  let i = 0
  return (((rootName ? rootName + '.' : '') + name || '')
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
    name: props.name,
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

export const renderFinalField = (element, {input: {name, ...input}, ...rest}) => {
  input.name = htmlizeName(name, rest.liform.rootName)

  return React.createElement(element, {...rest, name, input})
}

export default class Lifield extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { render, ...rest } = this.props

    return (render || this.props.liform.render.field)(rest)
  }
}
