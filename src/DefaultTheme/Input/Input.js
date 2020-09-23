import React from 'react';
import { Field } from '../Field/Field';
import { FieldRenderProps } from '../../field';

export const Input = props => {
    const {
        schema = true,
        input: {...input},
        placeholder,
        meta,
    } = props

    if (input.type === 'color' && input.value === '') {
        input.value = '#000000'
    }

    if (schema.pattern) {
        input.pattern = schema.pattern
    }

    input.placeholder = placeholder

    return (
        <Field className="liform-input" schema={schema} meta={meta}>
            { input.type === 'textarea' ? <textarea {...input}/> : <input {...input}/> }
        </Field>
    )
}

Input.propTypes = FieldRenderProps
