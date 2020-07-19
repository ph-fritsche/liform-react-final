import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import arrayMutators from 'final-form-arrays'
import { Form as FinalForm } from 'react-final-form';
import { buildSubmitHandler } from './submit';
import { buildFlatValidatorStack, buildFlatAjvValidate, buildFlatValidatorHandler, translateAjv } from './validate';
import { compileSchema } from './schema';

export function compileChildren (sections, children) {
    if (typeof(children) === 'function') {
        return children
    }

    let compiled = {...sections}
    if (children instanceof Object) {
        for (const child of (Array.isArray(children) ? children : [children])) {
            if (sections && Object.keys(sections).includes(child.type)) {
                compiled[child.type] = child.props.children
            } else {
                compiled.__rest__ = compiled.__rest__ || []
                compiled.__rest__.push(child)
            }
        }
    }
    return compiled
}

export const LiformContext = React.createContext()

export function Liform(props) {
    const [rootName] = useState(props.name || props.schema && props.schema.name || '')
    const [theme] = useState(props.theme)

    const schema = useMemo(() => compileSchema(props.schema), [props.schema])

    const [meta, setMeta] = useState(props.meta || {})
    const [value, setValue] = useState(props.value)

    const [validationErrors] = useState({})

    const sections = props.sections || theme.sections
    const children = useMemo(() => compileChildren(sections, props.children), [sections, props.children])
    const render = useMemo(() => ({...theme.render, ...props.render}), [theme, props.render])

    const updateData = useCallback((props) => {
        setMeta(props.meta || {})
        setValue(props.value)
    }, [setMeta, setValue])

    const liformApi = useMemo(() => ({
        rootName,
        theme,
        schema,
        meta,
        validationErrors,
        render,
        updateData,
    }), [
        rootName,
        theme,
        schema,
        meta,
        validationErrors,
        render,
        updateData,
    ])

    const onSubmit = useMemo(() => (props.buildSubmitHandler || buildSubmitHandler)(liformApi, {
        action: props.action,
        prepareRequest: props.prepareRequest,
        handleSubmitError: props.handleSubmitError,
        handleSubmitResponse: props.handleSubmitResponse,
        handleSubmitRedirectResponse: props.handleSubmitRedirectResponse,
        onSubmitRedirect: props.onSubmitRedirect,
        onSubmitHtmlResponse: props.onSubmitHtmlResponse,
        onSubmitSuccess: props.onSubmitSuccess,
        onSubmitFail: props.onSubmitFail,
    }), [
        props.buildSubmitHandler,
        liformApi,
        props.action,
        props.prepareRequest,
        props.handleSubmitError,
        props.handleSubmitResponse,
        props.handleSubmitRedirectResponse,
        props.onSubmitRedirect,
        props.onSubmitHtmlResponse,
        props.onSubmitSuccess,
        props.onSubmitFail,
    ])

    const onValidate = useMemo(() => buildFlatValidatorHandler(buildFlatValidatorStack(
        buildFlatAjvValidate(props.ajv, schema, props.ajvTranslator || translateAjv)
    ), liformApi), [props.ajv, schema, props.ajvTranslator, liformApi])

    const finalFormProps = {
        debug: props.debug,
        decorators: props.decorators,
        form: props.form,
        initialValues: {_: value},
        initialValuesEquals: props.initialValuesEquals,
        keepDirtyOnReinitialize: props.keepDirtyOnReinitialize !== false,
        mutators: { ...arrayMutators, ...props.mutators },
        onSubmit,
        subscription: props.subscription,
        validate: onValidate,
    }

    return (
        <LiformContext.Provider value={liformApi}>
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
                        render.container,
                        renderProps,
                        (typeof(children) === 'function') ?
                            children(renderProps) :
                            Object.keys(children).map(key => (
                                <React.Fragment key={key}>
                                    { (typeof(children[key]) === 'function') ? children[key](renderProps) : children[key] }
                                </React.Fragment>
                            ))
                    )
                }}
            />
        </LiformContext.Provider>
    )
}

Liform.propTypes = {
    schema: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    value: PropTypes.any,
    meta: PropTypes.object,
    name: PropTypes.string,
}
