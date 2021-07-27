import React, { ComponentProps } from 'react'
import { Field as FinalField, FieldProps, FieldRenderProps } from 'react-final-form'
import { buildFieldValidator } from '../validate'
import { finalizeName } from '../util'
import { LiformApi, LiformSchema, LifieldRender, LifieldWidget, LifieldRenderProps } from '../types'
import { FieldValidator } from 'final-form'
import { guessWidget } from './guessWidget'
import { renderFinalField } from './renderFinalField'

export function renderField<
    Widget extends LifieldWidget | LifieldRender = LifieldWidget | LifieldRender,
    Value extends unknown = unknown,
    InputElement extends HTMLElement = HTMLElement,
>(
    props: {
        liform: LiformApi,
        schema?: LiformSchema,
        Widget?: Widget,
    } & (Widget extends LifieldWidget
        ? ComponentProps<Widget>
        : FieldProps<Value, FieldRenderProps<Value, InputElement>, InputElement>
        ),
): React.ReactElement {
    const {
        liform,
        schema = true,
        Widget = guessWidget(schema, liform.theme),
        name,
        ...otherProps
    } = props

    if (typeof (Widget) === 'function') {
        return React.createElement(Widget, {
            liform,
            schema,
            name,
            ...otherProps,
        })
    } else if (typeof (Widget) !== 'object') {
        throw new Error('Field widgets must be functions or objects, got ' + JSON.stringify(Widget))
    }

    const { render, component, children, ...otherWidgetProps } = Widget
    const renderFunc = 'render' in Widget ? render : 'component' in Widget ? component : undefined

    const fieldProps: FieldProps<unknown, FieldRenderProps<unknown, HTMLElement>, HTMLElement> = {
        ...otherProps,
        ...compileFinalFieldProps(liform, {...otherProps, name}),
        ...otherWidgetProps,
    }

    if (renderFunc) {
        fieldProps.render = (props: FieldRenderProps<unknown, HTMLElement>) => renderFinalField(renderFunc, {
            ...props,
            liform,
            schema,
        } as LifieldRenderProps<Value, LiformApi>)
    } else if (children) {
        fieldProps.children = children
    } else if (!props.children) {
        throw new Error('Field widgets without render/component require props.children')
    }

    return React.createElement(FinalField, fieldProps)
}

function compileFinalFieldProps<
    Value extends unknown = unknown,
    InputElement extends HTMLElement = HTMLElement,
    RenderProps extends FieldRenderProps<Value, InputElement> = FieldRenderProps<Value, InputElement>,
    P extends FieldProps<Value, RenderProps, InputElement> = {name: string},
>(
    liform: LiformApi,
    props: P,
): P & {
    name: string
    validate: FieldValidator<Value>
} {
    return {
        ...props,
        name: finalizeName(props.name),
        validate: props.validate || buildFieldValidator(liform, props.name),
    }
}

