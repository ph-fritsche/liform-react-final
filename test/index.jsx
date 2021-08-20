import React from 'react'
import Renderer from 'react-test-renderer'
import Liform from '../src'

describe('Index', () => {
    it('Set theme per property on default export', () => {
        const container = jest.fn(() => null)
        Liform.theme = {render: {container}}

        Renderer.create(<Liform/>)

        expect(container).toBeCalled()
    })

    it('Set theme per jsx property on default export', () => {
        const container = jest.fn(() => null)
        const containerProp = jest.fn(() => null)
        Liform.theme = {render: {container}}

        Renderer.create(<Liform theme={{render: {container: containerProp}}}/>)

        expect(container).not.toBeCalled()
        expect(containerProp).toBeCalled()
    })
})
