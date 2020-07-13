import React from 'react';
import { Field } from '../Field/Field';

export const Input = props => {
    const {
        schema,
        input: {...input},
        placeholder,
        meta
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
