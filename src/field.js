import React from 'react';
import { Field as FinalField } from "react-final-form";

export const htmlizeName = (name) => {
  if (name === undefined) {
      return ''
  }

  let i = 0
  return name.replace('.', () => { i++; return i>1 ? '][' : '[' }) + ( i>0 ? ']' : '')
}

export const guessWidget = (fieldSchema, theme) => {
  let guesses = []

  if (fieldSchema.widget) {
      for (const propGuess of Array.isArray(fieldSchema.widget)? fieldSchema.widget : [fieldSchema.widget]) {
          if (theme[propGuess]) {
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
  } else if (theme[fieldSchema.format]) {
      typeGuess = fieldSchema.format
  } else {
      typeGuess = fieldSchema.type || null
  }
  if (typeGuess && guesses.indexOf(typeGuess) < 0) {
      guesses.push(typeGuess)
  }

  if (!typeGuess || !theme[typeGuess]) {
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
    validate: props.validate,
    validateFields: props.validateFields,
    value: props.value,

    placeholder: props.schema.placeholder || props.schema.attr && props.schema.attr.placeholder,
  }
}

export const renderField = (props) => {
  const theme = props.theme || props.liform.theme
  const Widget = props.widget || theme[guessWidget(props.schema, theme)]

  if (Widget instanceof Function) {
    return <Widget {...props}/>
  }

  let fieldProps = compileFinalFieldProps(props)

  if (typeof(Widget) === 'string') {
    fieldProps = { key: props.key, ...fieldProps, component: Widget }
  } else if (typeof(Widget) === 'object') {
    fieldProps = { ...props, ...fieldProps, ...Widget }
  }

  return <FinalField {...fieldProps}/>
}

export default class Lifield extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { render, ...rest } = this.props

    return (render || this.props.liform.renderField)(rest)
  }
}
