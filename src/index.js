import React from "react";
import PropTypes from "prop-types";
import { Form as FinalForm } from "react-final-form";
import { buildFlatValidatorExpander, buildFlatValidatorStack, buildFlatAjvValidate } from "./validate";
import { compileSchema } from "./schema";
import { buildRenderField } from "./field"
import DefaultTheme from "./themes/default";

class Liform extends React.Component {
  constructor(props) {
    super(props)
    this.schema = compileSchema(props.schema)
    this.theme = props.theme || Liform.defaultTheme
    this.rootName = props.name || this.schema.name || this.schema.title || ''
  }

  render() {
    let children
    if (this.props.children instanceof Function) {
      children = this.props.children
    } else {
      children = this.getParts()
      if (this.props.children instanceof Object) {
        for (const child of (Array.isArray(this.props.children) ? this.props.children : [this.props.children])) {
          if (children[child.type]) {
            children[child.type] = child.props.children
          } else {
            children.__rest__ = children.__rest__ || []
            children.__rest__.push(child)
          }
        }
      }
    }

    return (
      <FinalForm {...this.compileFinalFormProps(this.props)}
        render={(props) => {
          const liformProps = {form: props}

          liformProps.schema = this.schema
          liformProps.theme = this.theme
      
          liformProps.renderField = this.props.renderField || buildRenderField(this.theme)

          const Container = this.props.render || this.renderContainer
      
          return <Container {...liformProps}>{
            (props.children instanceof Function) ?
              props.children(liformProps) :
              Object.keys(children).map(key => <React.Fragment key={key}>
                { (children[key] instanceof Function) ? children[key](liformProps) : children[key] }
              </React.Fragment>)
          }</Container>
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

  compileFinalFormProps(props) {
    return {
      debug: props.debug,
      decorators: props.decorators,
      form: props.form,
      initialValues: props.initialValues || {...props.value, BirthdayType: 123},
      initialValuesEquals: props.initialValuesEquals,
      keepDirtyOnReinitialize: props.keepDirtyOnReinitialize,
      mutators: props.mutators,
      onSubmit: props.onSubmit || (() => {}),
      subscription: props.subscription,
      validate: props.validate || buildFlatValidatorExpander(this.rootName, buildFlatValidatorStack(
        buildFlatAjvValidate(props.ajv, props.schema, this.rootName)
      ))
    }
  }

  renderContainer(props) { return (
    <form
      onSubmit={props.handleSubmit}
      method={props.method || props.schema.method || 'POST'}
      action={props.action || props.schema.action}
      >
        { props.children }
    </form>
  )}

  renderHeader(props) { return <>
    { props.renderErrors === 'header' && Liform.renderErrors(props) }
  </>}

  renderForm({form, theme, ...props}) {
    return props.renderField({...props, name: this.rootName})
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
