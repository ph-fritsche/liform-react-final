import React from "react";
import PropTypes from "prop-types";
import DefaultTheme from "./themes/bootstrap3";
import { Form as FinalForm } from "react-final-form";
import renderFields from "./renderFields";
import renderField from "./renderField";
import buildSyncValidation from "./buildSyncValidation";
import { setError } from "./buildSyncValidation";
import compileSchema from "./compileSchema";

const BaseForm = props => {
  return (
    <form onSubmit={props.handleSubmit}>
      {renderFields(
        props.schema || {},
        props.theme || DefaultTheme,
        props.prefix || "",
        props.context
      )}
      <div className='error'>{props.error && <strong>{props.error}</strong>}</div>
      <button className="btn btn-primary" type="submit" disabled={props.submitting || false}>
        Submit
      </button>
    </form>
  );
};

const Liform = props => {
//  props.schema.showLabel = false;

  const schema = compileSchema(props.schema);
  const theme = props.theme || DefaultTheme;
  const onSubmit = props.handleSubmit || (() => {});

  const component = props.baseForm || BaseForm;

  /*
  const formName = props.formKey || props.schema.title || "form";
  const Form = FinalForm({
    onSubmit: props.onSubmit || (() => {}),
    render: renderFields.bind(this),
//    form: props.formKey || props.schema.title || "form",
//    validate: props.syncValidation || buildSyncValidation(schema, props.ajv),
    initialValues: props.initialValues,
    context: { ...props.context, formName }
  })(props.baseForm || BaseForm);
*/

  return (
    <FinalForm
      onSubmit={onSubmit}
      {...props}
      schema={schema}
      theme={theme}
    >
      {props => component(props)}
    </FinalForm>
  );
};

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
  renderFields,
  renderField,
  DefaultTheme,
  setError,
  EmbeddedLiform,
  buildSyncValidation,
  compileSchema
};
