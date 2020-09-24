import React from 'react'
import Renderer from 'react-test-renderer'
import { renderField, guessWidget, Lifield, renderFinalField } from '../src/field'
import { Field, Form } from 'react-final-form'
import { LiformContext } from '../src/form'

describe('Guess widget', () => {
    const theme = {
        field: {
            'string': {},
            'choice': {},
            'oneOf': {},
            'someFormat': {},
            'foo': {},
            'bar': {},
        },
    }
    const themeWithFallback = {
        field: {
            [null]: {},
        },
    }

    it('Per widget property', () => {
        expect(guessWidget({widget: ['bar', 'foo']}, theme)).toBe('bar')
        expect(guessWidget({widget: ['baz', 'foo']}, theme)).toBe('foo')
        expect(guessWidget({widget: 'foo'}, theme)).toBe('foo')
    })

    it('Per schema', () => {
        expect(guessWidget({type: 'string'}, theme)).toBe('string')
        expect(guessWidget({format: 'someFormat'}, theme)).toBe('someFormat')
        expect(guessWidget({enum: []}, theme)).toBe('choice')
        expect(guessWidget({oneOf: {}}, theme)).toBe('oneOf')
    })

    it('For fallback', () => {
        expect(guessWidget({widget: 'myWidget'}, themeWithFallback)).toBe(null)
        expect(guessWidget(undefined, themeWithFallback)).toBe(null)
    })

    it('Throw error if no widget is found', () => {
        expect(() => guessWidget({type: 'number'}, theme)).toThrow('No widget defined for number')
        expect(() => guessWidget({widget: 'myWidget'}, theme)).toThrow('No widget defined for myWidget,(null)')
        expect(() => guessWidget({type: 'number', widget: 'myWidget'}, theme)).toThrow('No widget defined for myWidget,number')
        expect(() => guessWidget({type: 'number', widget: 'number'}, theme)).toThrow('No widget defined for number')
        expect(() => guessWidget({type: 'number', widget: 'number'}, themeWithFallback)).toThrow('No widget defined for number')
    })
})

const renderFieldNode = (node, formProps) => (
    <Form
        onSubmit={() => {}}
        initialValues={{}}
        {...formProps}
    >
        {() => node}
    </Form>
)
const createFieldNode = (node, formProps) => Renderer.create(renderFieldNode(node, formProps))

describe('Render field', () => {
    const liform = {
        theme: {
            field: {
                foo: {
                    render: () => 'foo',
                },
                bar: {
                    component: () => 'bar',
                },
                baz: () => 'baz',
                native: {
                    component: 'input',
                },
                invalid: true,
                children: {},
            },
        },
        rootName: '',
        meta:{},
    }

    it('Widget function', () => {
        let field = renderField({liform, schema: {widget: 'baz'}})

        expect(typeof(field)).toBe('object')
        expect(field.type).toBe(liform.theme.field.baz)

        Renderer.create(field).root.findByType(liform.theme.field.baz)
    })

    it('Widget object with render/component', () => {
        let field

        field = renderField({liform, schema: {widget: 'bar'}})

        expect(field).toBeInstanceOf(Object)
        expect(field.type).toBe(Field)
        expect(field.props.render).toBeInstanceOf(Function)

        createFieldNode(field).root.findByType(liform.theme.field.bar.component)

        field = renderField({liform, schema: {widget: 'foo'}})

        expect(field).toBeInstanceOf(Object)
        expect(field.type).toBe(Field)
        expect(field.props.render).toBeInstanceOf(Function)

        createFieldNode(field).root.findByType(liform.theme.field.foo.render)

        field = renderField({liform, schema: {widget: 'native'}})

        expect(field).toBeInstanceOf(Object)
        expect(field.type).toBe(Field)

        createFieldNode(field).root.findByType(liform.theme.field.native.component)
    })

    it('Widget with children', () => {
        let field
        const children = (fieldProps) => fieldProps.input.name

        field = renderField({liform, schema: {widget: 'children'}, children})

        expect(field).toBeInstanceOf(Object)
        expect(field.type).toBe(Field)
        expect(field.props.children).toBe(children)

        expect(createFieldNode(field).root.findByType(Field).children).toEqual(['_'])
    })

    it('Throw error on invalid widget', () => {
        expect(() => renderField({liform, schema: {widget: 'invalid'}}))
            .toThrow('widgets must be')

        expect(() => renderField({liform, schema: {widget: 'children'}}))
            .toThrow('children')
    })

    it('Provide placeholder', () => {
        let field

        field = renderField({liform, schema: {widget: 'foo', placeholder: 'myPlaceholder'}})

        expect(createFieldNode(field).root.findByType(liform.theme.field.foo.render).props.placeholder).toBe('myPlaceholder')

        field = renderField({liform, schema: {widget: 'foo', attr: {placeholder: 'myPlaceholder'}}})

        expect(createFieldNode(field).root.findByType(liform.theme.field.foo.render).props.placeholder).toBe('myPlaceholder')
    })

    it('Do not rerender on every Final Form hook change', () => {
        const a = []
        const component = jest.fn((p) => a.push(p) || null)
        const liform = {
            theme: {
                field: {
                    foo: {
                        render: component,
                    },
                },
            },
            rootName: '',
            meta: {},
        }
        const props = {liform, name: 'foo', schema: {widget: 'foo'}}

        const form = createFieldNode(renderField(props))

        expect(component).toBeCalledTimes(1)

        Renderer.act(() => {
            form.update(renderFieldNode(renderField({...props})))
        })

        expect(component).toBeCalledTimes(1)

        Renderer.act(() => {
            props.someProp = 'someValue'
            form.update(renderFieldNode(renderField(props)))
        })

        expect(component).toBeCalledTimes(2)

        Renderer.act(() => {
            form.update(renderFieldNode(renderField(props), {initialValues: {_: {foo: 'someValue'}}}))
        })

        expect(component).toBeCalledTimes(3)

        Renderer.act(() => {
            form.update(renderFieldNode(renderField(props), {initialValues: {_: {foo: 'someValue', bar: 'someValue'}}}))
        })

        expect(component).toBeCalledTimes(3)
    })
})

describe('Extend render props from Final Form Field', () => {
    const component = () => null
    const liform = {
        theme: {
            field: {
                foo: {
                    render: component,
                },
            },
        },
        rootName: 'root.prop',
        validationErrors: {
            'foo.bar': ['validation error'],
        },
        meta: {
            errors: {
                'foo.bar': ['meta error'],
            },
        },
    }
    const createNode = (type, values) => {
        const field = renderField({liform, schema: {widget: 'foo', type}, name: 'foo.bar'})
        return createFieldNode(field, {initialValues: {_: values}}).root.findByType(component)
    }

    it('Html input name', () => {
        let node = createNode()

        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.name).toBe('root[prop][foo][bar]')
    })

    it('Correct value type for undefined fields', () => {
        let node

        node = createNode('someType', {foo: {bar: 'baz'}})
        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.value).toEqual('baz')

        node = createNode('array')
        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.value).toEqual([])

        node = createNode('object')
        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.value).toEqual({})

        node = createNode('string')
        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.value).toEqual('')

        node = createNode('someType')
        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.value).toEqual(undefined)

        node = createNode(undefined)
        expect(node.props.input).toBeInstanceOf(Object)
        expect(node.props.input.value).toEqual('')
    })

    it('Override error', () => {
        let node

        node = createNode()

        expect(node.props.meta).toBeInstanceOf(Object)
        expect(node.props.meta.error).toEqual(['meta error'])

        Renderer.act(() => {
            node.props.input.onChange('foo')
        })

        expect(node.props.meta).toBeInstanceOf(Object)
        expect(node.props.meta.error).toEqual(['validation error'])
    })
})

describe('Lifield component', () => {
    it('Render only on changed props', () => {
        const renderFunction = jest.fn(() => null)

        const node = Renderer.create(<Lifield foo="bar" render={renderFunction}/>)
        Renderer.act(() => {
            node.update(<Lifield foo="bar" render={renderFunction}/>)
        })
        Renderer.act(() => {
            node.update(<Lifield foo="baz" render={renderFunction}/>)
        })

        expect(renderFunction).toBeCalledTimes(2)
        expect(renderFunction).nthCalledWith(1, {foo: 'bar'})
        expect(renderFunction).nthCalledWith(2, {foo: 'baz'})
    })

    it('If no render prop is given, use render.field from Liform', () => {
        const liform = {
            render: {
                field: jest.fn(() => null),
            },
        }

        Renderer.create(<Lifield foo={1} liform={liform}/>)

        expect(liform.render.field).toBeCalledWith({foo: 1, liform})
    })

    it('If no liform prop is given, get it from LiformContext', () => {
        const liform = {
            render: {
                field: jest.fn(() => null),
            },
        }

        Renderer.create(<LiformContext.Provider value={liform}><Lifield foo={1}/></LiformContext.Provider>)

        expect(liform.render.field).toBeCalledWith({foo: 1, liform})
    })
})

describe('LifieldChildren via renderFinalField', () => {
    const objectA = {foo: 'bar'}
    const arrayA = ['bar']
    const props = {
        liform: {},
        schema: true,
        input: {
            name: 'foo',
        },
        meta: {},
    }

    it.each([
        [
            {...props, foo: 'bar'},
            {...props, foo: 'bar'},
            {...props, foo: 'baz'},
        ],
        [
            {...props, foo: objectA},
            {...props, foo: objectA},
            {...props, foo: {foo: 'bar'}},
        ],
        [
            {...props, input: {...props.input, foo: 'bar'}},
            {...props, input: {...props.input, foo: 'bar'}},
            {...props, input: {...props.input, foo: 'baz'}},
        ],
        [
            {...props, meta: {...props.meta, foo: 'bar'}},
            {...props, meta: {...props.meta, foo: 'bar'}},
            {...props, meta: {...props.meta, foo: 'baz'}},
        ],
        [
            {...props, meta: {...props.meta, foo: arrayA}},
            {...props, meta: {...props.meta, foo: arrayA}},
            {...props, meta: {...props.meta, foo: ['bar']}},
        ],
        [
            {...props, meta: {...props.meta, error: ['bar']}},
            {...props, meta: {...props.meta, error: ['bar']}},
            {...props, meta: {...props.meta, error: ['baz']}},
        ],
    ])('Render only on changed props', (props0, props1, props2) => {
        const renderFunction = jest.fn(() => null)
        const Component = renderFinalField.bind(undefined, renderFunction)

        const node = Renderer.create(<Component {...props0}/>)
        Renderer.act(() => {
            node.update(<Component {...props1}/>)
        })
        Renderer.act(() => {
            node.update(<Component {...props2}/>)
        })

        expect(renderFunction).toBeCalledTimes(2)
    })

})
