import React from 'react'
import { Lifield } from '..'
import { LiformRenderProps } from '../types'
import { objOrUndef, stringOrUndef } from './shared'

export function Container(
    props: LiformRenderProps,
): React.ReactElement {
    return (
        <form
            onSubmit={props.handleSubmit}
            onReset={props.handleReset}
            method={stringOrUndef(props.method) || objOrUndef(props.liform.schema)?.method || 'POST'}
            action={stringOrUndef(props.action) || objOrUndef(props.liform.schema)?.action || ''}
        >
            { props.children }
        </form>
    )
}

export const Reset = (): React.ReactElement => (
    <Lifield schema={{
        widget: ['reset', 'button'],
        title: 'Reset',
    }}/>
)

export const Submit = (): React.ReactElement => (
    <Lifield schema={{
        widget: ['submit', 'button'],
        title: 'Submit',
    }}/>
)
