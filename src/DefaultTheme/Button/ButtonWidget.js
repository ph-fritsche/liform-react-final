import React from 'react';
import PropTypes from 'prop-types'
import { SchemaProp } from '../../schema';

export const ButtonWidget = ({name, schema}) => {

    const types = ['submit', 'reset', 'button']
    let type
    if (typeof(schema.widget) === 'string') {
        type = types[types.indexOf(schema.widget)]
    } else if (Array.isArray(schema.widget)) {
        type = types.filter(t => schema.widget.indexOf(t) >= 0)[0]
    }

    return <button name={name} type={type || 'button'} className="liform-field liform-button">{schema.title}</button>
}


ButtonWidget.propTypes = {
    schema: SchemaProp,
    name: PropTypes.string,
}
