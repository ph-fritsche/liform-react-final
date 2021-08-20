import React from 'react'
import { compileChildren, rest } from '../../src/form/compileChildren'

it('Ignore sections if children is function', () => {
    const children = () => {}
    expect(compileChildren({}, children)).toBe(children)
})

it('Replace sections', () => {
    expect(compileChildren(
        {
            foo: <foo></foo>,
            bar: <bar></bar>,
        }, [
            <foo key="a"><baz></baz></foo>,
        ],
    )).toEqual(expect.objectContaining({
        foo: <baz></baz>,
        bar: <bar></bar>,
    }))

    expect(compileChildren(
        {
            foo: <foo></foo>,
            bar: <bar></bar>,
        },
        <foo><baz></baz></foo>,
    )).toEqual(expect.objectContaining({
        foo: <baz></baz>,
        bar: <bar></bar>,
    }))

    expect(compileChildren(
        {
            foo: null,
            bar: <bar></bar>,
        },
        <foo><baz></baz></foo>,
    )).toEqual(expect.objectContaining({
        foo: <baz></baz>,
        bar: <bar></bar>,
    }))
})

it('Add __rest__', () => {
    expect(compileChildren({
        foo: <foo></foo>,
    }, [
        <bar key="bar"></bar>,
    ])).toEqual({
        foo: <foo></foo>,
        [rest]: [
            <bar key="bar"></bar>,
        ],
    })
})
