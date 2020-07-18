import React from 'react'
import Renderer from 'react-test-renderer'
import { renderField, liformizeName, finalizeName, htmlizeName, guessWidget, Lifield } from '../src/field'
import { Field, Form } from 'react-final-form'

describe('Name conversion', () => {
    it('Liform to Final form', () => {
        expect(finalizeName(undefined)).toBe('_')
        expect(finalizeName('')).toBe('_')
        expect(finalizeName('foo')).toBe('_.foo')
    })

    it('Final Form to Liform', () => {
        expect(liformizeName('_')).toBe('')
        expect(liformizeName('_.foo')).toBe('foo')
        expect(liformizeName('_[0]')).toBe('0')
    })

    it('Final Form to HTML', () => {
        expect(htmlizeName('_', '')).toBe('')
        expect(htmlizeName('_', 'baz')).toBe('baz')
        expect(htmlizeName('_.foo', '')).toBe('foo')
        expect(htmlizeName('_.foo', 'baz')).toBe('baz[foo]')
        expect(htmlizeName('_.foo[1].bar', '')).toBe('foo[1][bar]')
        expect(htmlizeName('_.foo[1].bar', 'baz')).toBe('baz[foo][1][bar]')
    })
})

describe('Guess widget', () => {
    const theme = {
        field: {
            'string': {},
            'choice': {},
            'oneOf': {},
            'someFormat': {},
            'foo': {},
            'bar': {},
        }
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

    it('Throw error if no widget is found', () => {
        expect(() => guessWidget({type: 'number'}, theme)).toThrow('No widget defined for number')
        expect(() => guessWidget({widget: 'myWidget'}, theme)).toThrow('No widget defined for myWidget')
        expect(() => guessWidget({type: 'number', widget: 'myWidget'}, theme)).toThrow('No widget defined for myWidget,number')
        expect(() => guessWidget({type: 'number', widget: 'number'}, theme)).toThrow('No widget defined for number')
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
})
