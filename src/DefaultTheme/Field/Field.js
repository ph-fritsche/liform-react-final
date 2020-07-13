import React from 'react';

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
