import React, { PropsWithChildren } from 'react'
import { LifieldRenderProps, LiformSchema } from '../../types'
import { objOrUndef } from '../shared'

export function Field(
    {
        schema,
        meta: {error},
        className,
        children,
    }: PropsWithChildren<{
        schema: LiformSchema
        meta: LifieldRenderProps['meta']
        className: string
    }>,
): React.ReactElement {
    return (
        <div
            className={'liform-field ' + className}
        >
            <label>
                { objOrUndef(schema)?.title }
                { children }
            </label>
            { error?.map(e =>
                <div key={e} className="liform-error">{e}</div>,
            )}
        </div>
    )
}
