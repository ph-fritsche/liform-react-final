import React from 'react';
import { Lifield, finalizeName } from '..';

export const Form = (props) => (
    <Lifield
        liform={props.liform}
        schema={props.liform.schema}
    />
)

export const Action = (props) => (
    <div className="liform-action">
        { props.liform.render.reset && props.liform.render.reset(props) }
        { props.liform.render.submit && props.liform.render.submit(props) }
    </div>
)

export const FormErrors = (props) => {
    if (!props.liform.meta.errors) {
        return null
    }

    const registered = props.liform.form.getRegisteredFields()
    const errorPaths = Object.keys(props.liform.meta.errors).filter(key => registered.indexOf(finalizeName(key)) < 0)
    const Errors = ({errors, title}) => (
        <div className="liform-error-group">
            { title && <strong>{title}</strong> }
            { errors.map((e,i) => <div key={i} className="liform-error">{e}</div>) }
        </div>
    )

    return <div className="liform-errors">
        { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
    </div>
}

export default {

}