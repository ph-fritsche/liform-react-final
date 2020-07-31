import React, { useMemo, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import arrayMutators from 'final-form-arrays'
import { Form as FinalForm } from 'react-final-form';
import { buildSubmitHandler, buildSubmitHandlerProps } from './submit';
import { buildFlatValidatorStack, buildFlatAjvValidate, buildFlatValidatorHandler, translateAjv } from './validate';
import { compileSchema, SchemaProp } from './schema';

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

const MetaProp = PropTypes.objectOf(
    PropTypes.objectOf(
        PropTypes.array
    ),
)

export const LiformContextProp = PropTypes.shape({
    rootName: PropTypes.string,
    theme: PropTypes.object,
    schema: SchemaProp,
    meta: MetaProp,
    value: PropTypes.any,
    validationErrors: PropTypes.objectOf(PropTypes.array),
    render: PropTypes.objectOf(PropTypes.elementType),
    updateData: PropTypes.func,
})

export function Liform(props) {
    const rootName = props.name || props.schema && props.schema.name || ''
    const theme = props.theme
    const schema = useMemo(() => compileSchema(props.schema), [props.schema])
    const data = useMemo(() => ({meta: props.meta || {}, value: props.value}), [props.meta, props.value])

    const [,setData] = useState({})
    const { current: validationErrors } = useRef({})

    const sections = props.sections || theme.sections
    const children = useMemo(() => compileChildren(sections, props.children), [sections, props.children])
    const render = useMemo(() => ({...theme.render, ...props.render}), [theme, props.render])

    const updateData = useCallback((props) => {
        data.meta = props.meta || {}
        data.value = props.value
        setData({})
    }, [data, setData])

    const liformApi = useMemo(() => ({
        rootName,
        theme,
        schema,
        meta: data.meta,
        value: data.value,
        validationErrors,
        render,
        updateData,
    }), [
        rootName,
        theme,
        schema,
        data.meta,
        data.value,
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
        buildFlatAjvValidate(props.ajv, liformApi.schema, props.ajvTranslator || translateAjv)
    ), liformApi), [props.ajv, props.ajvTranslator, liformApi])

    const finalFormProps = {
        debug: props.debug,
        decorators: props.decorators,
        form: props.form,
        initialValues: {_: liformApi.value},
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
    schema: SchemaProp,
    value: PropTypes.any,
    meta: MetaProp,
    name: PropTypes.string,

    theme: PropTypes.shape({
        render: PropTypes.shape({
            container: PropTypes.elementType,
        }),
        sections: PropTypes.objectOf(
            PropTypes.oneOfType([PropTypes.elementType, PropTypes.element, PropTypes.oneOf([null])])
        ),
    }).isRequired,

    sections: PropTypes.objectOf(
        PropTypes.oneOfType([PropTypes.elementType, PropTypes.element, PropTypes.oneOf([null])])
    ),
    children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.element, PropTypes.arrayOf(PropTypes.element), PropTypes.oneOf([null])]),
    render: PropTypes.objectOf(PropTypes.elementType),

    buildSubmitHandler: PropTypes.func,
    ...buildSubmitHandlerProps,

    ajv: PropTypes.func,
    ajvTranslator: PropTypes.func,

    ...FinalForm.propTypes,
}
