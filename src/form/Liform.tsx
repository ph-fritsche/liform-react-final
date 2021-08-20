import React, { useMemo, useState, useCallback, useRef, ReactChild } from 'react'
import arrayMutators from 'final-form-arrays'
import { Form as FinalForm, FormProps, FormRenderProps } from 'react-final-form'
import { LiformApi, LiformMeta, LiformRenderFunction, LiformRenderProps, LiformSchema, LiformTheme } from '../types'
import { useSubmitHandler } from '../submit'
import { buildFlatValidatorStack, buildFlatAjvValidate, buildFlatValidatorHandler, translateAjv, AjvTranslator, FlatValidator } from '../validate'
import { compileSchema } from '../schema'
import type { Ajv } from 'ajv'
import { compileChildren, rest } from './compileChildren'
import { LiformContext } from './LiformContext'

export function Liform<
    Theme extends LiformTheme,
    Value extends unknown,
    SectionsProp extends Record<string, LiformRenderFunction | React.ReactChild | null>,
>(
    props: {
        theme: Theme
        name?: string
        schema: LiformSchema
        meta?: LiformMeta
        value?: Value
        sections?: SectionsProp
        children?: LiformRenderFunction | ReactChild | ReactChild[]
        validate: FlatValidator
    } & {
        ajv?: Ajv
        ajvTranslator?: AjvTranslator
    } & Parameters<typeof useSubmitHandler>[1] & FormProps<{_: Value}>,
): React.ReactElement {
    const rootName = props.name || typeof props.schema === 'object' && props.schema.name || ''
    const theme = props.theme
    const schema = useMemo(() => compileSchema(props.schema, props.schema), [props.schema])
    const data = useMemo(() => ({ meta: props.meta || {}, value: props.value }), [props.meta, props.value])

    const [, setData] = useState({})
    const { current: validationErrors } = useRef({})

    const sections = props.sections || theme.sections
    const children = useMemo(() => compileChildren(sections, props.children), [sections, props.children])

    const updateData = useCallback((props) => {
        data.meta = props.meta || {}
        data.value = props.value
        setData({})
    }, [data, setData])

    const liformApi: LiformApi<Value, Theme> = useMemo(() => ({
        rootName,
        theme,
        schema,
        meta: data.meta,
        value: data.value,
        validationErrors,
        updateData,
    }), [
        rootName,
        theme,
        schema,
        data.meta,
        data.value,
        validationErrors,
        updateData,
    ])

    const onSubmit = useSubmitHandler(liformApi, props)

    const onValidate = useMemo(() => buildFlatValidatorHandler(buildFlatValidatorStack(
        buildFlatAjvValidate(props.ajv, liformApi.schema, props.ajvTranslator || translateAjv),
        ...[props.validate].filter(Boolean),
    ), liformApi), [props.ajv, props.ajvTranslator, liformApi, props.validate])

    const finalFormProps: FormProps<{_: Value}> = {
        debug: props.debug,
        decorators: props.decorators,
        form: props.form,
        initialValues: { _: liformApi.value },
        initialValuesEquals: props.initialValuesEquals,
        keepDirtyOnReinitialize: props.keepDirtyOnReinitialize !== false,
        mutators: { ...arrayMutators, ...props.mutators },
        onSubmit,
        subscription: props.subscription,
        validate: onValidate,
    }

    return (
        <LiformContext.Provider value={liformApi as LiformApi}>
            <FinalForm {...finalFormProps}
                render={(finalFormRenderProps: FormRenderProps<{_: Value}>) => {

                    liformApi.form = finalFormRenderProps.form

                    const renderProps: LiformRenderProps<Value> = {
                        ...finalFormRenderProps,
                        handleReset: () => {
                            // https://github.com/final-form/final-form/issues/151#issuecomment-425867172
                            finalFormRenderProps.form.setConfig('keepDirtyOnReinitialize', false)
                            finalFormRenderProps.form.reset()
                            finalFormRenderProps.form.setConfig('keepDirtyOnReinitialize', true)
                        },
                        liform: liformApi,
                    }
                    return React.createElement(
                        theme.render.container,
                        renderProps,
                        children && (
                            (typeof (children) === 'function')
                                ? children(renderProps)
                                : Object.keys(children).map(key => {
                                    const child = children[key]

                                    return (
                                        <React.Fragment key={key}>
                                            {(typeof child === 'function') ? child(renderProps) : child}
                                        </React.Fragment>
                                    )
                                })
                        ),
                        typeof children === 'object'
                            ? children[rest]
                            : undefined,
                    )
                }}
            />
        </LiformContext.Provider>
    )
}
