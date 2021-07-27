import React from 'react'
import { Lifield, mapProperties } from '../..'
import { Errors, objOrUndef } from '../shared'
import { LifieldWidgetProps } from '../../types'

export function ObjectWidget(
    {
        liform,
        name,
        schema: schemaProp = true,
        ...others
    }: LifieldWidgetProps,
): React.ReactElement {
    const schema = objOrUndef(schemaProp) ?? {}

    return <fieldset className="liform-field liform-object">
        { schema.title && <legend>{ schema.title }</legend> }
        { Errors({liform, schema, name}) }
        { mapProperties(schema.properties || {}, (propSchema, key) => (
            <Lifield key={key} {...others}
                name={ (name || '') + ((name && String(name).slice(-1) !== ']') ? '.' : '') + key }
                schema={ propSchema }
                required={ Array.isArray(schema.required) && schema.required.includes(String(key)) }
            />
        )) }
    </fieldset>
}
