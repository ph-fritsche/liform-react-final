import React from 'react';
import { FieldRenderProps } from '../../field';
import { Input } from './Input'

export const ColorInput = props => {
    const {
        input: {
            value,
            ...input
        },
        ...others
    } = props

    return <Input
        {...others}
        input={{
            ...input,
            type: 'color',
            value: value || '#000000',
        }}
    />
}

ColorInput.propTypes = FieldRenderProps
