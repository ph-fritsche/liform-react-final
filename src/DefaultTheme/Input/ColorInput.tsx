import React from 'react';
import { LifieldRenderProps } from '../../types';
import { Input } from './Input'

export function ColorInput(
    {
        input: {
            value,
            ...input
        },
        ...others
    }: LifieldRenderProps,
): React.ReactElement {
    return <Input
        {...others}
        input={{
            ...input,
            type: 'color',
            value: value || '#000000',
        }}
    />
}
