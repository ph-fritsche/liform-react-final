import React from 'react';
import { Field } from '../Field/Field';
import { PureOptions } from './PureOptions';
import { FieldRenderProps } from '../../field';

export const Choice = (props) => {
    const {
        schema = true,
        input: {
            onChange: onChangeProp,
            ...input
        },
        placeholder,
        meta
    } = props

    if (schema.type === 'array' && !Array.isArray(input.value)) {
        input.value = []
    }

    return schema.choiceExpanded
        ? (
            <fieldset className="liform-field liform-choice">
                <legend>{ schema && schema.title }</legend>
                <div className="liform-options">
                    { (schema.enum || schema.items.enum).map((elValue,i) =>
                        <label key={i}>
                            <input
                                type={schema.type === 'array' ? 'checkbox' : 'radio'}
                                name={input.name + (schema.type === 'array' ? '[]' : '')}
                                value={elValue}
                                checked={schema.type === 'array' ? input.value.indexOf(elValue) >= 0 : input.value === elValue }
                                onChange={e => onChangeProp(
                                    schema.type === 'array'
                                        ? (e.target.checked ? input.value.concat([elValue]) : input.value.filter(v => v !== elValue))
                                        : (e.target.checked ? elValue : null)
                                ) }
                            />
                            { (schema.enumTitles || schema.items.enumTitles)[i] }
                        </label>
                    ) }
                </div>
                { meta.error && meta.error.map(e =>
                    <div key={e} className="liform-error">{e}</div>
                )}
            </fieldset>
        )
        : (
            <Field className="liform-choice" schema={schema} meta={meta}>
                <select {...input}
                    multiple={schema.type === 'array'}
                    onChange={e => onChangeProp(extractNativeSelectValue(e))}
                    onBlur={e => onChangeProp(extractNativeSelectValue(e))}
                >
                    { schema.type !== 'array' && placeholder && <option value="">{placeholder}</option> }
                    { (schema.enum || schema.items.enum) && <PureOptions values={schema.enum || schema.items.enum} labels={schema.enumTitles || schema.items.enumTitles}/> }
                </select>
            </Field>
        )
}

Choice.propTypes = FieldRenderProps

function extractNativeSelectValue (event) {
    if (!event || !(event.target instanceof HTMLSelectElement)) {
        return event
    }

    if (event.target.hasAttribute('multiple')) {
        const v = []
        for (let i = 0; i < event.target.selectedOptions.length; i++) {
            v.push(event.target.selectedOptions.item(i).value)
        }
        return v
    }

    return event.target.value
}
