import React from 'react';
import { Field } from '../Field/Field';
import { LifieldRenderProps } from '../../types';
import { objOrUndef } from '../shared';

export function NumberInput(
    {
        schema: schemaProp = true,
        input: {
            value,
            onChange,
            onBlur,
            ...input
        },
        placeholder,
        meta,
    }: LifieldRenderProps,
): React.ReactElement {
    const schema = objOrUndef(schemaProp) ?? {}

    input.defaultValue = value

    input.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value)
        if (e.target.value !== '' && v == e.target.valueAsNumber && (schema.type !== 'integer' || Number.isInteger(v))) {
            onChange(v)
        }
    }
    input.onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v
        if (e.target.value != '') {
            v = Number(e.target.value)
            const step = schema.step || schema.type === 'integer' && 1 || undefined
            if (step) {
                v = Math.round(v / step) * step
                const dotPos = String(step).indexOf('.')
                if (dotPos >= 0) {
                    v = Number(v.toFixed(String(step).length - dotPos - 1))
                }
            }
        } else {
            v = undefined
        }
        if (v !== value) {
            onChange(v)
            e.target.value = v === undefined ? '' : String(v)
        }
        onBlur(e)
    }

    input.step = schema.step || schema.type === 'integer' ? 1 : 0.1
    input.placeholder = placeholder

    return (
        <Field className="liform-number" schema={schema} meta={meta}>
            <input {...input} type="number"/>
            <span className="liform-number-unit">{schema.symbol}</span>
        </Field>
    )
}
