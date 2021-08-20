import React from 'react';
import { LifieldRenderProps } from '../../types';
import { objOrUndef } from '../shared';
import { Input } from './Input'

export function FileInput(
    {
        schema = true,
        input: {
            onChange,
            ...input
        },
        ...others
    }: LifieldRenderProps,
): React.ReactElement {
    const multiple = Boolean(objOrUndef(schema)?.attr?.multiple)

    return <Input
        {...others}
        schema={schema}
        input={{
            ...input,
            type: 'file',
            multiple,
            value: undefined,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files ?? []
                onChange(multiple ? Array.from(files) : files[0])
            },
        }}
    />
}
