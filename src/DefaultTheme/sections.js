import React from 'react';
import PropTypes from 'prop-types'
import { Lifield, finalizeName } from '..';
import { LiformContextProp } from '../form';
import { SchemaProp } from '../schema';

export const Form = (props) => (
    <Lifield
        liform={props.liform}
        schema={props.liform.schema}
    />
)

Form.propTypes = {
    liform: LiformContextProp,
    schema: SchemaProp,
}

export const Action = (props) => (
    <div className="liform-action">
        { props.liform.render.reset && props.liform.render.reset(props) }
        { props.liform.render.submit && props.liform.render.submit(props) }
    </div>
)

Action.propTypes = {
    liform: LiformContextProp,
}

const Errors = ({errors, title}) => (
    <div className="liform-error-group">
        { title && <strong>{title}</strong> }
        { errors.map((e,i) => <div key={i} className="liform-error">{e}</div>) }
    </div>
)

Errors.propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
}

export const FormErrors = (props) => {
    if (!props.liform.meta.errors) {
        return null
    }

    const registered = props.liform.form.getRegisteredFields()
    const errorPaths = Object.keys(props.liform.meta.errors).filter(key => registered.indexOf(finalizeName(key)) < 0)

    return <div className="liform-errors">
        { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
    </div>
}

FormErrors.propTypes = {
    liform: LiformContextProp,
}

export default {

}