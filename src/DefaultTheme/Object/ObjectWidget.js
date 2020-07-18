import React from 'react';
import { Lifield, mapProperties } from '../..';

export const ObjectWidget = props => {
    const {
        name,
        schema = true,
        ...others
    } = props

    return <fieldset className="liform-field liform-object">
        { schema.title && <legend>{ schema.title }</legend> }
        { mapProperties(schema.properties || {}, (propSchema, key) => (
            <Lifield key={key} {...others}
                name={ (name || '') + ((name && String(name).slice(-1) !== ']') ? '.' : '') + key }
                schema={ propSchema }
                required={ Array.isArray(schema.required) && schema.required.indexOf(key) >= 0 }
            />
        )) }
    </fieldset>
}

