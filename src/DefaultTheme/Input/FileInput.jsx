import React from 'react';
import { FieldRenderProps } from '../../field';
import { Input } from './Input'

export const FileInput = props => {
    const {
        schema = true,
        input: {
            onChange,
            ...input
        },
        ...others
    } = props

    const multiple = Boolean(schema.attr?.multiple)

    return <Input
        {...others}
        schema={schema}
        input={{
            ...input,
            type: 'file',
            multiple,
            value: undefined,
            onChange: e => onChange(multiple ? Array.from(e.target.files) : e.target.files[0]),
        }}
    />
}

FileInput.propTypes = FieldRenderProps
