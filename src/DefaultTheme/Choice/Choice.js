import React from 'react';
import { Field } from '../Field/Field';
import { PureOptions } from './PureOptions';

export const Choice = (props) => {
    const {
        liform,
        name,
        schema = true,
        input: {...input},
        placeholder,
        meta
    } = props

    if (schema.type === 'array' && !Array.isArray(input.value)) {
        input.value = []
    }

    return schema.choiceExpanded
        ? (
            <div className="liform-field liform-choice">
                <legend>{ schema && schema.title }</legend>
                <div className="liform-options">
                    { (schema.enum || schema.items.enum).map((elValue,i) =>
                        <label key={i}>
                            <input
                                type={schema.type === 'array' ? 'checkbox' : 'radio'}
                                name={input.name + (schema.type === 'array' ? '[]' : '')}
                                value={elValue}
                                checked={schema.type === 'array' ? input.value.indexOf(elValue) >= 0 : input.value === elValue }
                                onChange={(e) => { liform.form.change(name, schema.type === 'array' ?
                                    (e.target.checked ? input.value.concat([elValue]) : input.value.filter(v => v !== elValue)) :
                                    (e.target.checked ? elValue : null)
                                ) }}
                            />
                            { (schema.enumTitles || schema.items.enumTitles)[i] }
                        </label>
                    ) }
                </div>
            </div>
        )
        : (
            <Field className="liform-choice" schema={schema} meta={meta}>
                <select {...input} multiple={schema.type === 'array'}>
                    { schema.type !== 'array' && placeholder && <option value="">{placeholder}</option> }
                    { (schema.enum || schema.items.enum) && <PureOptions values={schema.enum || schema.items.enum} labels={schema.enumTitles || schema.items.enumTitles}/> }
                </select>
            </Field>
        )
}
