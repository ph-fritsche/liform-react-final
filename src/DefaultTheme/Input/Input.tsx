import React from 'react'
import { Field } from '../Field/Field'
import { LifieldRenderProps } from '../../types'
import { objOrUndef } from '../shared'

export function Input(
    {
        InputComponent = 'input',
        className = 'liform-input',
        schema = true,
        input,
        placeholder,
        meta,
    }: LifieldRenderProps,
): React.ReactElement {
    return (
        <Field className={className} schema={schema} meta={meta}>
            <InputComponent
                {...input}
                pattern={objOrUndef(schema)?.pattern}
                placeholder={placeholder}
            />
        </Field>
    )
}
