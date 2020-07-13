import React from 'react';
import { Field } from '../Field/Field';

export const HiddenInput = props => {
    const {
        schema,
        input: {name, value, onChange},
        meta
    } = props

    const element = <input type="hidden" name={name} value={value} onChange={onChange}/>

    return meta.errors
        ? (
            <Field className="liform-hidden" schema={schema} meta={meta}>
                { element }
            </Field>
        )
        : element
}
