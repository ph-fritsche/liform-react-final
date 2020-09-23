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

    return <Input
        {...others}
        schema={schema}
        input={{
            ...input,
            type: 'file',
            value: undefined,
            onChange: e => onChange(schema.multiple ? e.target.files : e.target.files[0]),
        }}
    />
}

FileInput.propTypes = FieldRenderProps
