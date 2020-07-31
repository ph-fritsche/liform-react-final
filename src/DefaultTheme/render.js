import React from 'react';
import PropTypes from 'prop-types'
import { Lifield } from '../'
import { LiformContextProp } from '../form';

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

Container.propTypes = {
    liform: LiformContextProp.isRequired,
    handleSubmit: PropTypes.func,
    handleReset: PropTypes.func,
    method: PropTypes.string,
    action: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element), PropTypes.oneOf([null])]),
}

export const Reset = () => (
    <Lifield schema={{
        widget: ['reset','button'],
        title: 'Reset',
    }}/>
)

export const Submit = () => (
    <Lifield schema={{
        widget: ['submit','button'],
        title: 'Submit',
    }}/>
)
