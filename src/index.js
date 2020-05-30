import React from "react";
import PropTypes from "prop-types";
import arrayMutators from "final-form-arrays"
import { Form as FinalForm } from "react-final-form";
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
    keepDirtyOnReinitialize: props.keepDirtyOnReinitialize,
    mutators: { ...arrayMutators, ...props.mutators },
    onSubmit: props.onSubmit || (() => {}),
    subscription: props.subscription,
    validate: props.validate || buildFlatValidatorHandler(buildFlatValidatorStack(
      buildFlatAjvValidate(props.ajv, props.schema, props.ajvTranslator || translateAjv)
    ), liform)
  }
}

const compileChildren = (parts, props) => {
  if (props.children instanceof Function) {
    return props.children
  }

  let children = parts
  if (props.children instanceof Object) {
    for (const child of (Array.isArray(props.children) ? props.children : [props.children])) {
      if (children[child.type]) {
        children[child.type] = child.props.children
      } else {
        children.__rest__ = children.__rest__ || []
        children.__rest__.push(child)
      }
    }
  }
  return children
}

export const LiformContext = React.createContext()

class Liform extends React.Component {
  constructor(props) {
    super(props)

    this.schema = compileSchema(props.schema)
    this.theme = props.theme || Liform.defaultTheme
    this.rootName = props.name || this.schema.name || ''
    this.children = compileChildren(this.getParts(), props)
    this.renderContainer = props.render || this.renderContainer
    this.renderField = props.renderField || renderField
    this.finalFormProps = compileFinalFormProps(this.props, this)
    this.renderReset = props.renderReset || this.renderReset
    this.renderSubmit = props.renderSubmit || this.renderSubmit
    this.meta = props.meta || {}
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

          return <this.renderContainer {...renderProps}>{
            (this.children instanceof Function) ?
              this.children(renderProps) :
              Object.keys(this.children).map(key => <React.Fragment key={key}>
                { (this.children[key] instanceof Function) ? this.children[key](renderProps) : this.children[key] }
              </React.Fragment>)
          }</this.renderContainer>
        }}
      />
    )
  }

  getParts() { return {
    header: null,
    form: this.renderForm,
    footer: this.renderErrors,
    action: this.renderAction,
  }}

  renderContainer(props) { return (
    <form
      onSubmit={props.handleSubmit}
      onReset={() => {props.liform.form.reset()}}
      method={props.method || props.liform.schema.method || 'POST'}
      action={props.action || props.liform.schema.action}
      >
        { props.children }
    </form>
  )}

  renderForm(props) { return (
    <Lifield
      liform={props.liform}
      schema={props.liform.schema}
    />
  ) }

  renderAction(props) { return <div className='liform-action'>
    { props.liform.renderReset && props.liform.renderReset(props) }
    { props.liform.renderSubmit && props.liform.renderSubmit(props) }
  </div> }

  renderReset(props) {
    return props.liform.renderField({
      liform: props.liform,
      'schema': {
        'widget':['reset','button'],
        title: 'Reset',
      },
    })
  }

  renderSubmit(props) {
    return props.liform.renderField({
      liform: props.liform,
      'schema': {
        'widget':['submit','button'],
        title: 'Submit',
      },
    })
  }

  renderErrors(props) {
    if (!props.liform.meta.errors) {
      return null
    }

    const errorPaths = [''].filter(key => props.liform.meta.errors[key])
    const Errors = props.liform.theme.errors

    return <div className='liform-errors'>
      { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
    </div>
  }

}

Liform.defaultTheme = DefaultTheme

const EmbeddedLiform = props => {
  const schema = compileSchema(props.schema);

  return renderField(schema, 
    props.fieldName || null, 
    props.theme || DefaultTheme,
    props.prefix || "");
  
}


Liform.propTypes = {
  schema: PropTypes.object,
  onSubmit: PropTypes.func,
  initialValues: PropTypes.object,
  syncValidation: PropTypes.func,
  formKey: PropTypes.string,
  baseForm: PropTypes.func,
  context: PropTypes.object,
  ajv: PropTypes.object
};

export default Liform;

export {
  EmbeddedLiform,
};
