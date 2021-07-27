import React from 'react'
import { isShallowEqual } from 'liform-util'
import { htmlizeName, liformizeName } from '../util'
import { LifieldRenderProps } from '../types'

export function renderFinalField<
    ComponentProps extends LifieldRenderProps
>(
    element: React.ComponentType<ComponentProps>,
    props: ComponentProps,
): React.ReactElement | null {
    return <LifieldChildren
        render={element}
        {...props}
    />
}

const LifieldChildren = React.memo(
    function LifieldChildren(
        {
            render: Component,
            input: { name, ...input },
            meta: { ...meta },
            liform,
            schema,
            ...rest
        }: LifieldRenderProps,
    ) {
        input.name = htmlizeName(name, liform.rootName)

        // if a value does not exist, final form provides an empty string
        if (typeof schema === 'object' && input.value === '') {
            if (schema.type === 'array') {
                input.value = []
            } else if (schema.type === 'object') {
                input.value = {}
            } else if (schema.type && schema.type !== 'string') {
                input.value = undefined
            }
        }

        const liformName = liformizeName(name)

        meta.error = ((meta.touched || meta.dirty) && liform.validationErrors && liform.validationErrors[liformName]
            || meta.pristine && liform.meta.errors && liform.meta.errors[liformName]) || undefined

        const placeholder = rest.placeholder
            || typeof schema === 'object'
                && (schema.placeholder
                    || schema.attr?.placeholder
                )

        return <Component {...{
            ...rest,
            name,
            schema,
            input,
            meta,
            placeholder,
        }}/>
    },
    (
        { input: prevInput, meta: { error: prevError, ...prevMeta }, ...prevRest },
        { input: nextInput, meta: { error: nextError, ...nextMeta }, ...nextRest },
    ) => {
        return isShallowEqual(prevRest, nextRest)
            && isShallowEqual(prevInput, nextInput)
            && isShallowEqual(prevMeta, nextMeta)
            && isShallowEqual(prevError, nextError)
    },
)
