import React from "react";
import { FieldArray as FinalFieldArray } from "react-final-form-arrays"
import { mapProperties } from "../../properties";
import Lifield from "../../field";

export const ArrayWidget = ({name, schema, ...props}) => {
    return <FinalFieldArray name={name} render={({fields, meta}) => (
        <fieldset className='liform-field liform-array'>
            { schema.title && <legend>{ schema.title }</legend> }
            { fields.map((name, index) => (
                <div key={name} className='liform-array-item'>
                    <Lifield {...props}
                        name={`${name}`}
                        schema={
                            Array.isArray(schema.items) ?
                                (index <= schema.items.length ? schema.items[index] : schema.additionalItems) : 
                                schema.items
                        }
                    />
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

    const types = ['submit', 'reset', 'button']
    let type
    if (typeof(schema.widget) === 'string') {
        type = types[types.indexOf(schema.widget)]
    } else if (Array.isArray(schema.widget)) {
        type = types.filter(t => schema.widget.indexOf(t) >= 0)[0]
    }

    return <button name={name} type={type || 'button'} className='liform-field liform-button'>{schema.title}</button>
}

export const ObjectWidget = ({name, schema, ...props}) => {
    return <fieldset className='liform-field liform-object'>
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

export const inputRender = ({schema, input: inputget}) => {
    const {...input} = inputget

    if (input.type === 'color' && input.value === '') {
        input.value = '#000000'
    }

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

class PureOptions extends React.PureComponent {
    render() {
        return this.props.values && this.props.values.map((v,i) =>
            <option key={v} value={v}>
                { this.props.labels && this.props.labels[i] || v }
            </option>
        )
    }
}

export const choiceRender = ({schema, input}) => {
    return <div className='liform-field liform-choice'>
        <label>
            { schema && schema.title }
            <select {...input}>
                <PureOptions values={schema.enum} labels={schema.enumTitles}/>
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

    // block
    button: ButtonWidget,
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
        'component': 'textarea',
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