import React from 'react'
import Renderer from 'react-test-renderer'
import Liform from '../src'
import { Form, Field } from 'react-final-form'

describe("Liform with single field form", () => {
    const props = {
        "schema":{"title":"text","type":"string","attr":[],"widget":["_text","text","form"]},
        "meta":null,
        "value": "foo"
    }

    it("Render", () => {
        const renderedComponent = Renderer.create(<Liform {...props}/>)

        expect(renderedComponent).toBeTruthy()
    })
})

describe("Liform with simple object form", () => {
    const props = {
        "schema":{"title":"form","required":["foo","bar"],"properties":{"foo":{"title":"foo","type":"string","attr":[],"widget":["_form_foo","text","form"],"propertyOrder":0},"bar":{"title":"bar","type":"number","symbol":null,"step":null,"attr":[],"widget":["_form_bar","number","form"],"propertyOrder":1}},"type":"object","attr":[],"widget":["_form","form"]},
        "meta":null,
        "value": {"foo": "FOO", "bar": 123}
    }

    it("Render", () => {
        const renderedComponent = Renderer.create(<Liform {...props}/>)

        expect(renderedComponent).toBeTruthy()
    })
})

