import React from 'react'
import Renderer from 'react-test-renderer'
import { Liform } from '../../src/form/Liform'

const getLastProps = (mockFn) => {
    expect(mockFn).toBeCalled()
    return mockFn.mock.calls[mockFn.mock.calls.length - 1][0]
}

describe('Liform', () => {
    it('Renders with minimal config', () => {
        const container = jest.fn(() => null)
        const theme = {render: {container}}

        const node = Renderer.create(<Liform theme={theme}/>)

        expect(node.root.findByType(container)).toBeTruthy()
    })

    it('Pass compiled children', () => {
        const container = jest.fn(props => props.children)
        const theme = {
            render: {container},
            sections: {foo: 'foo', bar: 'bar', baz: 'baz'},
        }

        let node

        const childrenFunction = jest.fn(() => 'foo')

        node = Renderer.create(<Liform theme={theme}>{childrenFunction}</Liform>)

        expect(getLastProps(childrenFunction).liform).toBe(getLastProps(container).liform)
        expect(node.root.findByType(container).children).toEqual(['foo'])

        node = Renderer.create(<Liform theme={theme}>
            <bar>{childrenFunction}</bar>
            <foo>bar</foo>
        </Liform>)

        expect(node.root.findByType(container).children).toEqual(['bar', 'foo', 'baz'])

        node = Renderer.create(<Liform theme={{render:{container}}}>
            <foo>fooChild</foo>
            <bar>barChild</bar>
        </Liform>)

        expect(node.root.findByType(container).children.length).toBe(2)
        expect(node.root.findByType(container).children[0].type).toBe('foo')
        expect(node.root.findByType(container).children[0].children).toEqual(['fooChild'])
        expect(node.root.findByType(container).children[1].type).toBe('bar')
        expect(node.root.findByType(container).children[1].children).toEqual(['barChild'])
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

    it('use custom validator', () => {
        const container = jest.fn(() => null)
        const theme = { render: { container } }

        const validator = jest.fn(() => ({
            'foo.bar': 'baz',
        }))

        Renderer.create(<Liform theme={theme} validate={validator}/>)

        expect(container).toBeCalled()

        Renderer.act(() => {
            getLastProps(container).form.registerField('_.someField', () => null, {})
            getLastProps(container).form.change('_.someField', 'someValue')
        })

        expect(validator).toBeCalledWith(
            {'someField': 'someValue'},
            getLastProps(container).liform,
        )

        expect(getLastProps(container).liform.validationErrors).toEqual({
            'foo.bar': ['baz'],
        })
    })
})
