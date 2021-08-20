/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from 'react'
import type { ComponentProps } from 'react'
import type { JSONSchema7 } from 'json-schema'
import type { FormApi } from 'final-form'
import type { FieldProps, FieldRenderProps, FormRenderProps } from 'react-final-form'

export type FinalFormValue<Value> = {_: Value}
export type FinalFieldValue<Value> = Value|undefined

export interface LiformData<T = unknown> {
    meta?: LiformMeta
    value?: T
}

export interface LiformProps<
    Value extends unknown = any,
> {
    name?: string
    schema: LiformSchema
    meta?: LiformMeta
    value?: Value
}

export interface LiformApi<
    Value extends unknown = any,
    Theme extends LiformTheme = LiformTheme,
> {
    rootName: string
    theme: Theme
    schema: LiformSchema
    meta: LiformMeta
    value: Value | undefined
    validationErrors: LiformErrors | undefined
    updateData(data: LiformData<Value>): void
    form?: FormApi<FinalFormValue<Value>>
}

export interface LiformTheme {
    render: {
        container: LiformRenderFunction
        field?: LifieldImplementation
        [k: string]: unknown
    }
    sections?: Record<string, LiformRenderFunction>
    field?: Record<string, LifieldWidget | LifieldRender>
    [k: string]: unknown
}

declare module 'json-schema' {
    interface JSONSchema7 {
        widget?: string[] | string
        attr?: Record<string, unknown>

        placeholder?: string

        step?: number
        symbol?: string

        allowAdd?: boolean
        allowDelete?: boolean

        choiceExpanded?: boolean
        enumTitles?: string[]
    }
}

export type LiformSchemaDefinition = JSONSchema7

export type LiformSchema = boolean | LiformSchemaDefinition & {
    name?: string
    method?: string
    action?: string
}

export interface LiformMeta {
    errors?: LiformErrors
}

export interface LiformErrors {
    [fieldPath: string]: string[]
}

export interface LiformRenderProps<
    Value extends unknown = any,
    Api extends LiformApi = LiformApi,
> extends FormRenderProps<FinalFormValue<Value>> {
    handleReset(): void
    liform: Api
    [k: string]: unknown
}

export type LiformRenderFunction<
    Value extends unknown = any,
    Api extends LiformApi<Value> = LiformApi<Value>
> = (props: LiformRenderProps<Value, Api>) => React.ReactElement

export interface LiformRenderFunctions<
    Value extends unknown = any,
    Api extends LiformApi<Value> = LiformApi<Value>,
> {
    container: LiformRenderFunction<Value, Api>
    field: LifieldImplementation
    [k: string]: unknown
}

export type LifieldWidget<
    Props extends Record<string, unknown> = Record<string, unknown>,
    Api extends LiformApi = LiformApi,
> = React.ComponentType<Props & LifieldWidgetProps<Api>>

export type LifieldWidgetProps<
    Api extends LiformApi = LiformApi,
> = {
    liform: Api
    schema: LiformSchema
    name: string
}

export type LifieldRenderProps<
    Value = unknown,
    Api extends LiformApi = LiformApi,
    Element extends HTMLElement = HTMLElement,
> = Omit<FieldRenderProps<FinalFieldValue<Value>, Element>, 'meta'> & {
    liform: Api
    schema: LiformSchema
    meta: Omit<FieldRenderProps<FinalFieldValue<Value>, Element>['meta'], 'error'> & {
        error?: string[]
    }
}

export type LifieldRender<
    Value = unknown,
    Api extends LiformApi = LiformApi,
> = {
    render: React.ComponentType<LifieldRenderProps<Value, Api>>
    component: never
    children: never
    [otherProp: string]: unknown
} | {
    render: never
    /** @deprecated */
    component: React.ComponentType<LifieldRenderProps<Value, Api>>
    children: never
    [otherProp: string]: unknown
} | {
    render: never
    component: never
    children: React.ReactChildren
    [otherProp: string]: unknown
}

export type LifieldImplementation<
    Widget extends LifieldWidget | LifieldRender = LifieldWidget | LifieldRender,
    Value extends unknown = any,
    InputElement extends HTMLElement = HTMLElement,
> = (
    props: {
        name: string,
        liform: LiformApi,
        schema?: LiformSchema,
        Widget?: Widget,
    } & (Widget extends LifieldWidget
        ? ComponentProps<Widget>
        : FieldProps<Value, FieldRenderProps<Value, InputElement>, InputElement>
        ),
) => React.ReactElement
