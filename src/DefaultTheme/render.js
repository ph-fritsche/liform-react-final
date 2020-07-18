import React from 'react';

export const Container = (props) => (
    <form
        onSubmit={props.handleSubmit}
        onReset={props.handleReset}
        method={props.method || props.liform.schema && props.liform.schema.method || 'POST'}
        action={props.action || props.liform.schema && props.liform.schema.action || ''}
    >
        { props.children }
    </form>
)

export const Reset = (props) => props.liform.render.field({
    liform: props.liform,
    schema: {
        widget: ['reset','button'],
        title: 'Reset',
    },
})

export const Submit = (props) => props.liform.render.field({
    liform: props.liform,
    schema: {
        widget: ['submit','button'],
        title: 'Submit',
    },
})
