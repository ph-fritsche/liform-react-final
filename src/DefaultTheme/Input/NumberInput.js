import React from 'react';
import { Field } from '../Field/Field';
import { FieldRenderProps } from '../../field';

export const NumberInput = props => {
    const {
        schema = true,
        input: {
            value,
            onChange,
            onBlur,
            ...input
        },
        placeholder,
        meta
    } = props

    input.defaultValue = value

    const ref = React.createRef()
    input.onChange = e => {
        const v = Number(e.target.value)
        if (e.target.value !== '' && v == e.target.value && (schema.type !== 'integer' || Number.isInteger(v))) {
            onChange(v)
        }
    }
    input.onBlur = (e) => {
        let v
        if (e.target.value != '') {
            v= Number(e.target.value)
            const step = schema.step || schema.type === 'integer' ? 1 : undefined
            if (step) {
                v = Math.round(v / step) * step
            }
        } else {
            v = undefined
        }
        if (v !== value) {
            onChange(v)
            ref.current.value = v
        }
        onBlur(e)
    }

    input.step = schema.step || schema.type === 'integer' ? 1 : 0.1
    input.placeholder = placeholder

    return (
        <Field className="liform-number" schema={schema} meta={meta}>
            <input {...input} type="number" ref={ref}/>
            <span className="liform-number-unit">{schema.symbol}</span>
        </Field>
    )
}

NumberInput.propTypes = FieldRenderProps
