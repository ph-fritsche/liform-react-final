import React from 'react';
import { Field } from '../Field/Field';
import { FieldRenderProps } from '../../field';

export const HiddenInput = props => {
    const {
        schema = true,
        input: {name, value, onChange},
        meta,
    } = props

    const element = <input type="hidden" name={name} value={value} onChange={onChange}/>

    return meta.error
        ? (
            <Field className="liform-hidden" schema={schema} meta={meta}>
                { element }
            </Field>
        )
        : element
}

HiddenInput.propTypes = FieldRenderProps
