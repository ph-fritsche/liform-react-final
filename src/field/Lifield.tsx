import { isShallowEqual } from 'liform-util'
import React, { ComponentProps, useContext } from 'react'
import { LiformContext } from '../form/LiformContext'
import { LifieldImplementation, LiformApi } from '../types'
import { renderField } from './renderField'

export function Lifield({
    name,
    liform: liformProp,
    render: renderProp,
    ...others
}: Omit<ComponentProps<LifieldImplementation>, 'liform'> & {
    liform?: LiformApi
    render?: LifieldImplementation
}): React.ReactElement {
    const liformContext = useContext(LiformContext)
    const liform = liformProp || liformContext

    if (!liform) {
        throw new Error('If you render Lifield outside of Liform, you need to pass LiformApi as a prop.')
    }

    const render = renderProp || liform.theme.render.field || renderField

    return <LifieldMemo
        render={render}
        props={{
            name,
            liform,
            ...others,
        }}
    />
}

const LifieldMemo = React.memo(
    function LifieldMemo(
        p: {
            render: LifieldImplementation
            props: ComponentProps<LifieldImplementation>
        },
    ): React.ReactElement {
        return p.render(p.props)
    },
    (prev, next) => {
        return prev.render === next.render
            && isShallowEqual(prev.props, next.props)
    },
)
