import React from 'react'
import PropTypes from 'prop-types'
import { renderFinalField, finalizeName } from '../'
import { Field } from 'react-final-form'

export const renderErrors = renderFinalField.bind(
    undefined,
    ({meta}) => meta.error && meta.error.map(e => <div key={'error-'+e} className="liform-error">{e}</div>) || null
)

export function Errors({liform, schema, name}) {
    const finalName = finalizeName(name)

    return <Field name={finalName} liform={liform} schema={schema} render={renderErrors}/>
}

Errors.propTypes = {
    liform: PropTypes.object.isRequired,
    schema: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    name: PropTypes.string.isRequired,
}
