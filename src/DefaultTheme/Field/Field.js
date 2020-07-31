import React from 'react';
import PropTypes from 'prop-types'
import { SchemaProp } from '../../schema';

export const Field = ({schema, meta: {error}, className, children}) => (
    <div
        className={'liform-field ' + className}
    >
        <label>
            { schema && schema.title }
            { children }
        </label>
        { error && error.map(e =>
            <div key={e} className="liform-error">{e}</div>
        )}
    </div>
)

Field.propTypes = {
    schema: SchemaProp,
    meta: PropTypes.shape({
        error: PropTypes.oneOfType([PropTypes.array, PropTypes.oneOf([false])]),
    }),
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}
