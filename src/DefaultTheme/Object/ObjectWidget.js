import React from 'react';
import { Lifield, mapProperties } from '../..';

export const ObjectWidget = ({name, schema, ...props}) => {
    return <fieldset className="liform-field liform-object">
        { schema.title && <legend>{ schema.title }</legend> }
        { mapProperties(schema.properties || {}, (propSchema, key) => (
            <Lifield key={key} {...props}
                name={ (name || '') + ((name && String(name).slice(-1) !== ']') ? '.' : '') + key }
                schema={ propSchema }
                required={ Array.isArray(schema.required) && schema.required.indexOf(key) >= 0 }
            />
        )) }
    </fieldset>
}

