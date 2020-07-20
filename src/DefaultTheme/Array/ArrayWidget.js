import React from 'react';
import { FieldArray as FinalFieldArray } from 'react-final-form-arrays'
import { Lifield, finalizeName, liformizeName } from '../..'
import { Errors } from '../shared';

export const ArrayWidget = props => {
    const {
        liform,
        name,
        schema = true,
        ...others
    } = props

    const finalName = finalizeName(name)

    return <FinalFieldArray name={finalName} render={({fields, meta}) => (
        <fieldset className="liform-field liform-array">
            { schema.title && <legend>{ schema.title }</legend> }
            { Errors({liform, schema, name}) }
            { fields.map((name, index) => (
                <div key={name} className="liform-array-item">
                    <Lifield {...others}
                        name={liformizeName(name)}
                        schema={
                            Array.isArray(schema.items) ?
                                (index <= schema.items.length ? schema.items[index] : schema.additionalItems) : 
                                schema.items
                        }
                    />
                    { (schema.allowDelete || Array.isArray(meta.initial) && index >= meta.initial.length) &&
                        <button type="button" onClick={() => fields.remove(index)}><span role="img" aria-label="remove collection element">❌</span></button>
                    }
                </div>
            )) }
            { schema.allowAdd && <button type="button" onClick={() => fields.push()}><span role="img" aria-label="add collection element">➕</span></button> }
        </fieldset>
    )}/>
}