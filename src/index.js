import React from "react";
import PropTypes from "prop-types";
import arrayMutators from "final-form-arrays"
import { Form as FinalForm } from "react-final-form";
import { buildFlatValidatorExpander, buildFlatValidatorStack, buildFlatAjvValidate } from "./validate";
import { compileSchema } from "./schema";
import { renderField } from "./field"
import DefaultTheme from "./themes/default";

const compileFinalFormProps = (rootName, props) => {
  return {
    debug: props.debug,
    decorators: props.decorators,
    form: props.form,
    initialValues: props.initialValues || (rootName != '' ? {[rootName]: props.value} : props.value),
    initialValuesEquals: props.initialValuesEquals,
    keepDirtyOnReinitialize: props.keepDirtyOnReinitialize,
    mutators: { ...arrayMutators, ...props.mutators },
    onSubmit: props.onSubmit || (() => {}),
    subscription: props.subscription,
    validate: props.validate || buildFlatValidatorExpander(rootName, buildFlatValidatorStack(
      buildFlatAjvValidate(props.ajv, props.schema, rootName)
    ))
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
    this.finalFormProps = compileFinalFormProps(this.rootName, this.props)
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
    header: this.renderHeader,
    form: this.renderForm.bind(this),
    footer: this.renderFooter,
//    submit: this.renderSubmit
  }}

  renderContainer(props) { return (
    <form
      onSubmit={props.handleSubmit}
      method={props.method || props.liform.schema.method || 'POST'}
      action={props.action || props.liform.schema.action}
      >
        { props.children }
    </form>
  )}

  renderHeader(props) { return <>
    { props.renderErrors === 'header' && Liform.renderErrors(props) }
  </>}

  renderForm(props) {
    return props.liform.renderField({
      liform: props.liform,
      name: props.liform.rootName,
      schema: props.liform.schema
    })
  }

  renderFooter(props) { return <>
    { props.renderErrors === 'footer' && Liform.renderErrors(props) }
  </>}

  renderSubmit(props) {
    return props.renderField(
      {'widget':['submit','button'], },
      'Submit',
      props.theme,
      props.prefix,
      props.context,
      false
    )
  }

  renderErrors(props) {
    return !Array.isArray(props.meta.errors) ? null : Object.keys(props.meta.errors).map(propertyPath => {
      return <div class='error-group alert alert-warning'>
        <strong>{propertyPath}</strong>
        { props.meta.errors[propertyPath].map(error => {
          <div class='error'>{error}</div>
        })}
      </div>
    })
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
