import React from 'react'
import { Lifield, finalizeName } from '..'
import { LiformRenderProps } from '../types'

export function Form(
    {
        liform,
    }: LiformRenderProps,
): React.ReactElement {
    return <Lifield liform={liform} schema={liform.schema}/>
}

export function Action(
    props : LiformRenderProps,
): React.ReactElement {
    const {
        liform: {
            theme: {
                render: {
                    reset,
                    submit,
                },
            },
        },
    } = props

    return (
        <div className="liform-action">
            { typeof reset === 'function' && reset(props) }
            { typeof submit === 'function' && submit(props) }
        </div>
    )
}

export function FormErrors(
    {
        liform: {
            form,
            meta: {
                errors = {},
            },
        },
    }: LiformRenderProps,
): React.ReactElement {
    const registered = form?.getRegisteredFields()
    const errorPaths = Object.keys(errors).filter(key => !registered?.includes(finalizeName(key)))

    return <div className="liform-errors">
        {errorPaths.map(propertyPath => (
            <div key={propertyPath} className="liform-error-group">
                {<strong>{propertyPath}</strong>}
                {errors[propertyPath]?.map((e, i) => <div key={i} className="liform-error">{e}</div>)}
            </div>
        ))}
    </div>
}
