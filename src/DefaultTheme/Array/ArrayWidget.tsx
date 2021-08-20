import React, { ComponentProps } from 'react'
import { FieldArray as FinalFieldArray } from 'react-final-form-arrays'
import { Lifield, finalizeName, liformizeName } from '../..'
import { Errors } from '../shared'
import { LifieldWidgetProps } from '../../types'

export function ArrayWidget(
    {
        liform,
        name,
        schema: schemaProp = true,
        ...others
    }: ComponentProps<typeof Lifield> & LifieldWidgetProps,
): React.ReactElement {
    const finalName = finalizeName(name)
    const schema = typeof schemaProp === 'object' ? schemaProp : {}

    return <FinalFieldArray name={finalName} render={({fields, meta}) => (
        <fieldset className="liform-field liform-array">
            { schema.title && <legend>{ schema.title }</legend> }
            { Errors({liform, schema, name}) }
            { fields.map((name, index) => (
                <div key={name} className="liform-array-item">
                    <Lifield {...others}
                        name={liformizeName(name)}
                        schema={
                            Array.isArray(schema.items)
                                ? (index < schema.items.length ? schema.items[index] : schema.additionalItems)
                                : schema.items
                        }
                    />
                    { (schema.allowDelete || Array.isArray(meta.initial) && index >= meta.initial.length)
                        && <button type="button" onClick={() => fields.remove(index)}><span role="img" aria-label="remove collection element">❌</span></button>
                    }
                </div>
            )) }
            { (schema.allowAdd || (fields.length ?? 0) < (Array.isArray(meta.initial) ? meta.initial.length : 0))
                && <button type="button" onClick={() => fields.push(undefined)}><span role="img" aria-label="add collection element">➕</span></button>
            }
        </fieldset>
    )}/>
}
