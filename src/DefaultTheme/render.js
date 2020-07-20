import React from 'react';
import { Lifield } from '../'

export const Container = props => (
    <form
        onSubmit={props.handleSubmit}
        onReset={props.handleReset}
        method={props.method || props.liform.schema && props.liform.schema.method || 'POST'}
        action={props.action || props.liform.schema && props.liform.schema.action || ''}
    >
        { props.children }
    </form>
)

export const Reset = props => (
    <Lifield schema={{
        widget: ['reset','button'],
        title: 'Reset',
    }}/>
)

export const Submit = props => (
    <Lifield schema={{
        widget: ['submit','button'],
        title: 'Submit',
    }}/>
)
