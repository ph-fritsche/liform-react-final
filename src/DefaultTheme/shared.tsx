import React from 'react'
import { renderFinalField, finalizeName } from '..'
import { Field } from 'react-final-form'
import { LifieldRenderProps, LifieldWidgetProps } from '../types'

export function renderErrors(
    props: LifieldRenderProps,
): React.ReactElement|null {
    return renderFinalField(Error, props)
}

function Error(
    { meta }: LifieldRenderProps,
): React.ReactElement {
    return <div>
        {meta.error?.map(e => (
            <div key={'error-' + e} className="liform-error">{e}</div>
        ))}
    </div>
}

export function Errors(
    {
        liform,
        schema,
        name,
    }: LifieldWidgetProps,
): React.ReactElement {
    const finalName = finalizeName(name)

    return <Field
        name={finalName}
        render={(props) => renderErrors({...props, liform, schema})}
    />
}

export function objOrUndef<T>(
    obj: T,
// eslint-disable-next-line @typescript-eslint/ban-types
): T extends object
    ? T extends Array<unknown> ? undefined : T
    : undefined
export function objOrUndef<T>(
    obj: T,
): T | undefined {
    return Array.isArray(obj) || typeof obj !== 'object'
        ? undefined
        : obj
}

export function arrayOrUndef<T>(
    obj: T,
): T extends Array<unknown> ? T : undefined
export function arrayOrUndef<T>(
    obj: T,
): T | undefined {
    return Array.isArray(obj) ? obj : undefined
}

export function stringOrUndef<T>(
    obj: T,
): T extends string ? T : undefined
export function stringOrUndef<T>(
    obj: T,
): T | undefined {
    return typeof obj === 'string' ? obj : undefined
}
