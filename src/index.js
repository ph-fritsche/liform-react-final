import React from "react";
import PropTypes from "prop-types";
import arrayMutators from "final-form-arrays"
import { Form as FinalForm } from "react-final-form";
import { buildSubmitHandler } from "./submit";
import { buildFlatValidatorStack, buildFlatAjvValidate, buildFlatValidatorHandler, translateAjv } from "./validate";
import { compileSchema } from "./schema";
import Lifield, { renderField } from "./field"
import DefaultTheme from "./themes/default";

const compileFinalFormProps = (props, liform) => {
  return {
    debug: props.debug,
    decorators: props.decorators,
    form: props.form,
    initialValues: props.initialValues || props.value,
    initialValuesEquals: props.initialValuesEquals,
    keepDirtyOnReinitialize: props.keepDirtyOnReinitialize || true,
    mutators: { ...arrayMutators, ...props.mutators },
    onSubmit: (props.buildSubmitHandler || buildSubmitHandler)(liform, props),
    subscription: props.subscription,
    validate: props.validate || buildFlatValidatorHandler(buildFlatValidatorStack(
      buildFlatAjvValidate(props.ajv, props.schema, props.ajvTranslator || translateAjv)
    ), liform)
  }
}

const compileChildren = (parts, children) => {
  if (children instanceof Function) {
    return children
  }

  let compiled = {...parts}
  if (children instanceof Object) {
    for (const child of (Array.isArray(children) ? children : [children])) {
      if (compiled[child.type]) {
        compiled[child.type] = child.props.children
      } else {
        compiled.__rest__ = compiled.__rest__ || []
        compiled.__rest__.push(child)
      }
    }
  }
  return compiled
}

const renderContainer = (props) => (
  <form
    onSubmit={props.handleSubmit}
    onReset={() => {props.liform.form.reset()}}
    method={props.method || props.liform.schema.method || 'POST'}
    action={props.action || props.liform.schema.action}
    >
      { props.children }
  </form>
)

const renderForm = (props) => (
  <Lifield
    liform={props.liform}
    schema={props.liform.schema}
  />
)

const renderAction = (props) => (
  <div className='liform-action'>
    { props.liform.renderReset && props.liform.renderReset(props) }
    { props.liform.renderSubmit && props.liform.renderSubmit(props) }
  </div>
)

const renderReset = (props) => props.liform.renderField({
  liform: props.liform,
  'schema': {
    'widget':['reset','button'],
    title: 'Reset',
  },
})

const renderSubmit = (props) => props.liform.renderField({
  liform: props.liform,
  'schema': {
    'widget':['submit','button'],
    title: 'Submit',
  },
})

const renderErrors = (props) => {
  if (!props.liform.meta.errors) {
    return null
  }

  const registered = props.liform.form.getRegisteredFields()
  const errorPaths = Object.keys(props.liform.meta.errors).filter(key => registered.indexOf(key) < 0)
  const Errors = props.liform.theme.errors

  return <div className='liform-errors'>
    { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
  </div>
}

const parts = {
  header: null,
  form: renderForm,
  footer: renderErrors,
  action: renderAction,
}

export const LiformContext = React.createContext()

class Liform extends React.Component {
  constructor(props) {
    super(props)

    this.rootName = props.name || this.schema.name || ''
    this.theme = props.theme || Liform.defaultTheme

    this.schema = compileSchema(props.schema)
    this.meta = props.meta || {}

    this.children = compileChildren(props.parts || parts, props.children)

    this.renderField = props.renderField || renderField
    this.renderReset = props.renderReset || renderReset
    this.renderSubmit = props.renderSubmit || renderSubmit

    this.finalFormProps = compileFinalFormProps(this.props, this)

    this.validationErrors = {}
  }

  render() { return (
      <FinalForm {...this.finalFormProps}
        render={(props) => {

          this.form = props.form

          const renderProps = {
            ...props,
            liform: this,
          }

          return React.createElement(
            this.props.render || renderContainer,
            renderProps,
            (this.children instanceof Function) ?
              this.children(renderProps) :
              Object.keys(this.children).map(key => <React.Fragment key={key}>
                  { (this.children[key] instanceof Function) ? this.children[key](renderProps) : this.children[key] }
              </React.Fragment>)
          )
        }}
      />
    )
  }
}

Liform.defaultTheme = DefaultTheme

Liform.propTypes = {
  schema: PropTypes.object,
  value: PropTypes.any,
  meta: PropTypes.object,
  name: PropTypes.string,
};

export default Liform;

export {
};
