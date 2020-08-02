import React from 'react';
import PropTypes from 'prop-types'
import { Lifield, finalizeName, FormRenderProps } from '..';

export const Form = props => {
    const {
        liform
    } = props

    return <Lifield liform={liform} schema={liform.schema}/>
}

Form.propTypes = FormRenderProps

export const Action = props => {
    const {
        liform: {
            render: {
                reset,
                submit,
            },
        },
    } = props

    return (
        <div className="liform-action">
            { reset && reset(props) }
            { submit && submit(props) }
        </div>
    )
}

Action.propTypes = FormRenderProps

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

export const FormErrors = props => {
    const {
        liform: {
            meta: {
                errors = {}
            }
        }
    } = props

    const registered = props.liform.form.getRegisteredFields()
    const errorPaths = Object.keys(errors).filter(key => registered.indexOf(finalizeName(key)) < 0)

    return <div className="liform-errors">
        { errorPaths.map(propertyPath => <Errors key={propertyPath} title={propertyPath} errors={props.liform.meta.errors[propertyPath]}/>) }
    </div>
}

FormErrors.propTypes = FormRenderProps
