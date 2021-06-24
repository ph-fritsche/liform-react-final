import React from 'react';
import PropTypes from 'prop-types'
import { Field } from '../Field/Field';
import { FieldRenderProps } from '../../field';

export const Input = props => {
    const {
        InputComponent = 'input',
        className = 'liform-input',
        schema = true,
        input,
        placeholder,
        meta,
    } = props

    return (
        <Field className={className} schema={schema} meta={meta}>
            <InputComponent
                {...input}
                pattern={schema.pattern}
                placeholder={placeholder}
            />
        </Field>
    )
}

Input.propTypes = {
    ...FieldRenderProps,
    InputComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
}
