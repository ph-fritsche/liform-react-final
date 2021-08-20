import type React from 'react';
import { LiformRenderFunction } from '../types';

export const rest = Symbol('rest')

type CompiledSections<Sections> = ({
    [K in keyof Sections]: Sections[K]
} & {
    [rest]: React.ReactNodeArray
})

export function compileChildren<
    Sections extends Record<string, LiformRenderFunction | React.ReactChild | null> | undefined,
    Children extends LiformRenderFunction | React.ReactChild | React.ReactChild[] | undefined,
>(
    sections: Sections,
    children: Children,
): Children extends LiformRenderFunction
    ? LiformRenderFunction
    : CompiledSections<Sections>
export function compileChildren<
    Sections extends Record<string, LiformRenderFunction | React.ReactChild | null>,
    Children extends LiformRenderFunction | React.ReactChild | React.ReactChild[]
>(
    sections: Sections,
    children: Children,
): LiformRenderFunction | CompiledSections<Sections> {
    if (typeof (children) === 'function') {
        return children
    }

    const compiled: {
        [K in keyof Sections]: Sections[K]
    } & {
        [rest]: React.ReactNodeArray
    } = {
        ...sections,
        [rest]: [],
    }
    for (const child of (Array.isArray(children) ? children : [children]) as (LiformRenderFunction | React.ReactChild)[]) {
        if (sections
            && typeof child === 'object'
            && typeof child.type === 'string'
            && child.type in sections
        ) {
            compiled[child.type as keyof Sections] = child.props.children
        } else {
            compiled[rest].push(child)
        }
    }

    return compiled
}
