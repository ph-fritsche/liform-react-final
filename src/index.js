import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import arrayMutators from "final-form-arrays"
import { Form as FinalForm } from "react-final-form";
import { buildSubmitHandler } from "./submit";
import { buildFlatValidatorStack, buildFlatAjvValidate, buildFlatValidatorHandler, translateAjv } from "./validate";
import { compileSchema } from "./schema";
import Lifield, { renderField, finalizeName } from "./field"
import DefaultTheme from "./themes/default";

const compileChildren = (sections, children) => {
  if (children instanceof Function) {
    return children
  }

  let compiled = {...sections}
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
    onReset={props.handleReset}
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
    { props.liform.render.reset && props.liform.render.reset(props) }
    { props.liform.render.submit && props.liform.render.submit(props) }
  </div>
)

const renderReset = (props) => props.liform.render.field({
  liform: props.liform,
  'schema': {
    'widget':['reset','button'],
    title: 'Reset',
  },
})

const renderSubmit = (props) => props.liform.render.field({
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
  const errorPaths = Object.keys(props.liform.meta.errors).filter(key => registered.indexOf(finalizeName(key)) < 0)
  const Errors = props.liform.theme.errors

  return <div className='liform-errors'>
    { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
  </div>
}

const sections = {
  header: null,
  form: renderForm,
  footer: renderErrors,
  action: renderAction,
}

export const LiformContext = React.createContext()

function Liform(props) {
  const children = useMemo(() => compileChildren(props.sections || sections, props.children), [props.sections || sections, props.children])

  const [rootName, setRootName] = useState(props.name || props.schema.name || '')
  const [theme, setTheme] = useState(props.theme || Liform.defaultTheme)

  const schema = useMemo(() => compileSchema(props.schema), [props.schema])

  const [meta, setMeta] = useState(props.meta || {})
  const [value, setValue] = useState(props.value)

  const [validationErrors, setValidationErrors] = useState({})

  const [renderFunctions, setRenderFunctions] = useState({
    field: props.renderField || renderField,
    reset: props.renderReset || renderReset,
    submit: props.renderSubmit || renderSubmit,
  })

  function updateData(props) {
    setMeta(props.meta || {})
    setValue(props.value)
  }

  function updateRender(props) {
    setRenderFunctions({...renderFunctions, ...props})
  }

  const liformApiProps = {
    rootName,
    theme,
    schema,
    meta,
    validationErrors,
    render: renderFunctions,
    updateData,
    updateRender,
  }
  const liformApi = useMemo(() => liformApiProps, Object.keys(liformApiProps).map(k => liformApiProps[k]))

  const submitProps = {
    action: props.action,
    prepareRequest: props.prepareRequest,
    buildSubmitHandler: props.buildSubmitHandler || buildSubmitHandler,
    handleSubmitError: props.handleSubmitError,
    handleSubmitResponse: props.handleSubmitResponse,
    handleSubmitRedirectResponse: props.handleSubmitRedirectResponse,
    onSubmitRedirect: props.onSubmitRedirect,
    onSubmitHtmlResponse: props.onSubmitHtmlResponse,
    onSubmitSuccess: props.onSubmitSuccess,
    onSubmitFail: props.onSubmitFail,
  }
  const onSubmit = useMemo(() => buildSubmitHandler(liformApi, submitProps), [].concat([liformApi], Object.keys(submitProps).map(k => submitProps[k])))

  const onValidate = useMemo(() => buildFlatValidatorHandler(buildFlatValidatorStack(
    buildFlatAjvValidate(props.ajv, schema, props.ajvTranslator || translateAjv)
  ), liformApi), [props.ajv, props.ajvTranslator, liformApi])

  const finalFormProps = {
    debug: props.debug,
    decorators: props.decorators,
    form: props.form,
    initialValues: {_: value},
    initialValuesEquals: props.initialValuesEquals,
    keepDirtyOnReinitialize: false, //props.keepDirtyOnReinitialize !== false,
    mutators: { ...arrayMutators, ...props.mutators },
    onSubmit,
    subscription: props.subscription,
    validate: onValidate,
  }

  return <LiformContext.Provider value={liformApi}>
    <FinalForm {...finalFormProps}
      render={(finalFormRenderProps) => {

        liformApi.form = finalFormRenderProps.form

        const renderProps = {
          ...finalFormRenderProps,
          handleReset: () => {
            // https://github.com/final-form/final-form/issues/151#issuecomment-425867172
            liformApi.form.setConfig('keepDirtyOnReinitialize', false)
            liformApi.form.reset()
            liformApi.form.setConfig('keepDirtyOnReinitialize', true)
          },
          liform: liformApi,
        }

        return React.createElement(
          props.render || renderContainer,
          renderProps,
          (children instanceof Function) ?
            children(renderProps) :
            Object.keys(children).map(key => (
              <React.Fragment key={key}>
                { (children[key] instanceof Function) ? children[key](renderProps) : children[key] }
              </React.Fragment>
            ))
        )
      }}
    />
  </LiformContext.Provider>
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
