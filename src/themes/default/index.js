import React from "react";
import { FieldArray as FinalFieldArray } from "react-final-form-arrays"
import { mapProperties } from "../../properties";

export const ArrayWidget = ({name, schema, ...props}) => {
    return <FinalFieldArray name={name} render={({fields, meta}) => (
        <fieldset className='liform-field liform-array'>
            { schema.title && <legend>{ schema.title }</legend> }
            { fields.map((name, index) => (
                <div key={name} className='liform-array-item'>
                    { props.renderField({ ...props,
                        name: `${name}`,
                        schema: Array.isArray(schema.items) ?
                            (index <= schema.items.length ? schema.items[index] : schema.additionalItems) : 
                            schema.items,
                    })}
                    { (schema.allowDelete || Array.isArray(meta.initial) && index >= meta.initial.length) &&
                        <button type='button' onClick={() => fields.remove(index)}>❌</button>
                    }
                </div>
            )) }
            { schema.allowAdd && <button type='button' onClick={() => fields.push()}>➕</button> }
        </fieldset>
    )}/>
}

export const ButtonWidget = ({name, schema, ...props}) => {
    return <button name={name} type='button' className='liform-field liform-button'>{schema.title}</button>
}

export const ObjectWidget = ({name, schema, ...props}) => {
    return <fieldset className='liform-field liform-object'>
        { schema.title && <legend>{ schema.title }</legend> }
        { mapProperties(schema.properties || {}, (propSchema, key) => (
            <React.Fragment key={key}>
                {props.renderField({ ...props,
                    name: (name || '') + ((name && String(name).slice(-1) !== ']') ? '.' : '') + key,
                    schema: propSchema,
                    required: Array.isArray(schema.required) && schema.required.indexOf(key) >= 0,
                })}
            </React.Fragment>
        )) }
    </fieldset>
}

export const inputRender = ({schema, input, ...props}) => {
    return <div className='liform-field liform-string'>
        <label>
            { schema && schema.title }
            { input.type === 'textarea' ?
                <textarea {...input}/>:
                <input {...input} value={ input.value == '' ? undefined : input.value }/>
            }
        </label>
    </div>
}

export const choiceRender = ({schema, input, ...props}) => {
    return <div className='liform-field liform-choice'>
        <label>
            { schema && schema.title }
            <select {...input}>
                { schema.enum && schema.enum.map((v,i) => <option key={v} value={v}>{ schema.enumTitles && schema.enumTitles[i] || v }</option>) }
            </select>
        </label>
    </div>
}

export default {
    // type
    array: ArrayWidget,
    boolean: {
        'render': inputRender,
        'type': 'checkbox',
    },
    integer: {
        'render': inputRender,
        'type': 'integer',
    },
    number: {
        'render': inputRender,
        'type': 'number',
    },
    object: ObjectWidget,
    string: {
        'render': inputRender,
    },

    // extra
    button: ButtonWidget,

    // block
    choice: {
        'render': choiceRender,
    },
    color: {
        'render': inputRender,
        'type': 'color',
    },
    date: {
        'render': inputRender,
        'type': 'date',
    },
    datetime: {
        'render': inputRender,
        'type': 'date-time',
    },
    file: {
        'render': inputRender,
        'type': 'date-time',
    },
    hidden: 'input',
    radio: {
        'render': inputRender,
        'type': 'radio',
    },
    textarea: {
        'render': inputRender,
        'type': 'textarea',
    },
    time: {
        'render': inputRender,
        'type': 'time',
    },
    week: {
        'render': inputRender,
        'type': 'week',
    },
}