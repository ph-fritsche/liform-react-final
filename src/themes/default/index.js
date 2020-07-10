import React from "react";
import { FieldArray as FinalFieldArray } from "react-final-form-arrays"
import { Lifield, mapProperties, renderField } from "../../";
import { finalizeName } from "../../field";

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
                        <button type='button' onClick={() => fields.remove(index)}><span role='img' aria-label='remove collection element'>❌</span></button>
                    }
                </div>
            )) }
            { schema.allowAdd && <button type='button' onClick={() => fields.push()}><span role='img' aria-label='add collection element'>➕</span></button> }
        </fieldset>
    )}/>
}

export const ButtonWidget = ({name, schema}) => {

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

export class PureOptions extends React.PureComponent {
    render() {
        return this.props.values && this.props.values.map((v,i) =>
            <option key={v} value={v}>
                { this.props.labels && this.props.labels[i] || v }
            </option>
        )
    }
}

export const choiceRender = ({liform, name, schema, input: {...input}, placeholder, meta}) => {
    if (schema.type === 'array' && !Array.isArray(input.value)) {
        input.value = []
    }

    if (schema.choiceExpanded) {
        return <div className='liform-field liform-choice'>
            <legend>{ schema && schema.title }</legend>
            <div className='liform-options'>
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
    } else {
        return <div className='liform-field liform-choice'>
            <label>
                { schema && schema.title }
                <select {...input} multiple={schema.type === 'array'}>
                    { schema.type !== 'array' && placeholder && <option value=''>{placeholder}</option> }
                    { (schema.enum || schema.items.enum) && <PureOptions values={schema.enum || schema.items.enum} labels={schema.enumTitles || schema.items.enumTitles}/> }
                </select>
                { renderFieldError(liform, name, meta) }
            </label>
        </div>
    }

}

export const inputRender = ({liform, name, schema, input: {...input}, placeholder, meta}) => {
    if (input.type === 'color' && input.value === '') {
        input.value = '#000000'
    }

    if (schema.pattern) {
        input.pattern = schema.pattern
    }

    input.placeholder = placeholder

    return <div className='liform-field liform-input'>
        <label>
            { schema && schema.title }
            { input.type === 'textarea' ? <textarea {...input}/> : <input {...input}/> }
        </label>
        { renderFieldError(liform, name, meta) }
    </div>
}

export const hiddenRender = ({liform, schema, input: {name, value, onChange}, meta}) => {
    const element = <input type='hidden' name={name} value={value} onChange={onChange}/>
    const errors = renderFieldError(liform, name, meta)
    if (errors) {
        return <div className='liform-field liform-hidden'>
            { element }
            <label>
                { schema && schema.title }
                { errors }
            </label>
        </div>
    } else {
        return element
    }
}

export const numberRender = ({liform, name, schema, input: {value, onChange, onBlur, ...input}, placeholder, meta}) => {
    input.defaultValue = value

    const ref = React.createRef()
    input.onChange = e => {
        const v = Number(e.target.value)
        if (e.target.value !== '' && v == e.target.value && (schema.type !== 'integer' || Number.isInteger(v))) {
            onChange(v)
        }
    }
    input.onBlur = (e) => {
        let v
        if (e.target.value != '') {
            v= Number(e.target.value)
            const step = schema.step || schema.type === 'integer' ? 1 : undefined
            if (step) {
                v = Math.round(v / step) * step
            }
        } else {
            v = undefined
        }
        if (v !== value) {
            onChange(v)
            ref.current.value = v
        }
        onBlur(e)
    }

    input.step = schema.step || schema.type === 'integer' ? 1 : 0.1
    input.placeholder = placeholder

    return <div className='liform-field liform-number'>
        <label>
            { schema && schema.title }
            <input {...input} type='number' ref={ref}/>
            <span className='liform-number-unit'>{schema.symbol}</span>
        </label>
        { renderFieldError(liform, name, meta) }
    </div>
}

const renderFieldError = ({meta: {error}}) => {
    return error && error.map(e =>
        <div key={e} className='liform-error'>{e}</div>
    )
}

const renderContainer = (props) => (
    <form
        onSubmit={props.handleSubmit}
        onReset={props.handleReset}
        method={props.method || props.liform.schema.method || 'POST'}
        action={props.action || props.liform.schema.action}
    >
        { props.children }
    </form>
)

export const renderForm = (props) => (
    <Lifield
        liform={props.liform}
        schema={props.liform.schema}
    />
)

export const renderAction = (props) => (
    <div className='liform-action'>
        { props.liform.render.reset && props.liform.render.reset(props) }
        { props.liform.render.submit && props.liform.render.submit(props) }
    </div>
)

const renderReset = (props) => props.liform.render.field({
    liform: props.liform,
    schema: {
        widget: ['reset','button'],
        title: 'Reset',
    },
})

const renderSubmit = (props) => props.liform.render.field({
    liform: props.liform,
    schema: {
        widget: ['submit','button'],
        title: 'Submit',
    },
})

export const renderFormErrors = (props) => {
    if (!props.liform.meta.errors) {
        return null
    }

    const registered = props.liform.form.getRegisteredFields()
    const errorPaths = Object.keys(props.liform.meta.errors).filter(key => registered.indexOf(finalizeName(key)) < 0)
    const Errors = ({errors, title}) => (
        <div className='liform-error-group'>
            { title && <strong>{title}</strong> }
            { errors.map((e,i) => <div key={i} className='liform-error'>{e}</div>) }
        </div>
    )

    return <div className='liform-errors'>
        { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
    </div>
}

export default {
    sections: {
        header: null,
        form: renderForm,
        footer: null,
        errors: renderFormErrors,
        action: renderAction,
    },
    render: {
        container: renderContainer,
        field: renderField,
        reset: renderReset,
        submit: renderSubmit,
    },
    field: {
        // type
        array: ArrayWidget,
        boolean: {
            'render': inputRender,
            'type': 'checkbox',
        },
        integer: {
            'render': numberRender,
        },
        number: {
            'render': numberRender,
        },
        object: ObjectWidget,
        string: {
            'render': inputRender,
        },

        // block - symfony native types - https://symfony.com/doc/current/reference/forms/types.html
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
            'type': 'datetime-local',
        },
        email: {
            'render': inputRender,
            'type': 'email',
        },
        file: {
            'render': inputRender,
            'type': 'file',
        },
        hidden: {
            render: hiddenRender,
        },
        password: {
            'render': inputRender,
            'type': 'password',
        },
        radio: {
            'render': inputRender,
            'type': 'radio',
        },
        range: {
            'render': inputRender,
            'type': 'range',
        },
        search: {
            'render': inputRender,
            'type': 'search',
        },
        textarea: {
            'render': inputRender,
            'type': 'textarea',
        },
        time: {
            'render': inputRender,
            'type': 'time',
        },
        tel: {
            'render': inputRender,
            'type': 'tel',
        },
        url: {
            'render': inputRender,
            'type': 'url',
        },
        week: {
            'render': inputRender,
            'type': 'week',
        },
    },
}