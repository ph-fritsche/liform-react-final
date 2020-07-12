import React from 'react'
import Renderer from 'react-test-renderer'
import { compileChildren, Liform } from '../src/form'
import { shallowEqual } from '../src/util/equal'

describe('Compile children', () => {
    it('Ignore sections if children is function', () => {
        const children = () => {}
        expect(compileChildren({}, children)).toBe(children)
    })

    it('Replace sections', () => {
        expect(compileChildren({
            a: <foo></foo>,
            b: <bar></bar>,
        }, [
            <a><baz></baz></a>,
        ])).toEqual({
            a: <baz></baz>,
            b: <bar></bar>,
        })

        expect(compileChildren({
            a: <foo></foo>,
            b: <bar></bar>,
        }, <a><baz></baz></a>)).toEqual({
            a: <baz></baz>,
            b: <bar></bar>,
        })
    })

    it('Add __rest__', () => {
        expect(compileChildren({
            a: <foo></foo>,
        }, [
            <b></b>,
        ])).toEqual({
            a: <foo></foo>,
            __rest__: [
                <b></b>,
            ],
        })
    })
})

const getLastProps = (mockFn) => {
    expect(mockFn).toBeCalled()
    return mockFn.mock.calls[mockFn.mock.calls.length - 1][0]
}

describe('Liform', () => {
    it('Renders with minimal config', () => {
        const container = jest.fn(() => null)
        const theme = {render: {container}}

        const node = Renderer.create(<Liform theme={theme}/>)

        node.root.findByType(container)
    })

    it('Pass compiled children', () => {
        const container = jest.fn(props => props.children)
        const theme = {
            render: {container},
            sections: {a: 'foo', b: 'bar', c: 'baz'},
        }

        let node

        const childrenFunction = jest.fn(() => 'foo')

        node = Renderer.create(<Liform theme={theme}>{childrenFunction}</Liform>)

        expect(getLastProps(childrenFunction).liform).toBe(getLastProps(container).liform)
        expect(node.root.findByType(container).children).toEqual(['foo'])

        node = Renderer.create(<Liform theme={theme}>
            <b>{childrenFunction}</b>
            <a>bar</a>
        </Liform>)

        expect(node.root.findByType(container).children).toEqual(['bar', 'foo', 'baz'])
    })

    it('Update data', () => {
        const container = jest.fn(() => null)
        const theme = {render: {container}}

        Renderer.create(<Liform theme={theme}/>)

        expect(container).toBeCalled()
        expect(getLastProps(container).liform.meta).toEqual({})

        const newData = {
            meta: {foo: 'bar'},
            value: 'baz',
        }
        Renderer.act(() => {
            getLastProps(container).liform.updateData(newData)
        })

        expect(getLastProps(container).liform.meta).toEqual(newData.meta)
        expect(getLastProps(container).form.getState().values).toEqual({_: newData.value})
    })

    it('Reset Final Form', () => {
        const container = jest.fn(() => null)
        const theme = {render: {container}}
        const fieldState = jest.fn()

        Renderer.create(<Liform theme={theme}/>)

        expect(container).toBeCalled()

        Renderer.act(() => {
            getLastProps(container).form.registerField('foo.bar', fieldState, {dirty: true}, {})
            getLastProps(container).form.change('foo.bar', 'baz')
        })

        expect(getLastProps(fieldState).dirty).toBe(true)

        Renderer.act(() => {
            getLastProps(container).handleReset()
        })

        expect(getLastProps(fieldState).dirty).toBe(false)
    })
})