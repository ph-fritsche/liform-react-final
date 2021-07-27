import React from 'react';
import { Field } from '../Field/Field';
import { LifieldRenderProps } from '../../types';

export function HiddenInput(
    {
        schema = true,
        input: {name, value, onChange},
        meta,
    }: LifieldRenderProps,
): React.ReactElement {
    const element = <input type="hidden" name={name} value={value} onChange={onChange}/>

    return meta.error
        ? (
            <Field className="liform-hidden" schema={schema} meta={meta}>
                { element }
            </Field>
        )
        : element
}
