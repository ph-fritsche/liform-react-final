import React from 'react'
import { LifieldWidgetProps } from '../../types'

export function ButtonWidget(
    {
        name,
        schema: schemaProp,
    }: LifieldWidgetProps,
): React.ReactElement {

    const types = ['submit', 'reset', 'button'] as const
    const schema = typeof schemaProp === 'object' ? schemaProp : {}
    const widget = typeof schema === 'object' ? schema.widget : undefined

    let type
    if (typeof(widget) === 'string') {
        type = types.find(v => v === schema.widget)
    } else if (Array.isArray(schema.widget)) {
        type = types.filter(t => schema.widget?.includes(t))[0]
    }

    return <button name={name} type={type || 'button'} className="liform-field liform-button">{schema.title}</button>
}
