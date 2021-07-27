import React from 'react'
import { buildSubmitHandler, useSubmitHandler } from '../src/submit'
import { FORM_ERROR } from 'final-form'
import { create } from 'react-test-renderer'

let realDocument
let realFetch

beforeEach(() => {
    realDocument = global.document
    realFetch = global.fetch
})

afterEach(() => {
    global.document = realDocument
    global.fetch = realFetch
})

function mockDocument(doc) {
    delete global.document
    return global.document = doc
}

function mockFetch(...results) {
    delete global.fetch
    return global.fetch = jest.fn((...args) => {
        const next = results.shift(results)
        const result = typeof next === 'function' ? next(...args) : next
        return result instanceof Promise
            ? result
            : typeof result === 'object'
                ? Promise.resolve(result)
                : Promise.reject(result)
    })
}

describe('Submit handler', () => {
    it('useSubmitHandler hook provides submit handler', () => {
        const builtResult = () => {}
        const builtFn = jest.fn(() => builtResult)
        const prepareRequestFn = () => {}
        const liform = {}

        let handler
        create(React.createElement(() => {
            handler = useSubmitHandler(liform, {
                buildSubmitHandler: builtFn,
                action: 'foo',
                prepareRequest: prepareRequestFn,
            })
            return null
        }))

        expect(builtFn).toBeCalled()
        expect(builtFn.mock.calls[0][0]).toBe(liform)
        const handlerProps = builtFn.mock.calls[0][1]
        expect(handlerProps).toHaveProperty('action', 'foo')
        expect(handlerProps).toHaveProperty('prepareRequest', prepareRequestFn)

        expect(handler).toBe(builtResult)
    })

    it('Inject prepareRequest', () => {
        const fetch = mockFetch()
        const handler = jest.fn(() => ({}))

        const liform = {}
        const promise = buildSubmitHandler(liform, {prepareRequest: handler})({_: 'foo'})

        expect(handler).toBeCalled()
        expect(handler.mock.calls[0][0]).toBe('foo')
        expect(handler.mock.calls[0][1]).toBe(liform)

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return promise.catch(() => {})
    })

    it('Create multipart requests if values contain Blob objects', () => {
        const fetch = mockFetch()
        const blob = new Blob(['BAZ'])
        const handler = buildSubmitHandler({rootName: 'form'}, {onSubmitFail: () => {}, handleSubmitError: () => {}})

        const promise = handler({_: {foo: 'bar', bar: ['a', 'b', 'c'], baz: blob}})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        const form = fetch.mock.calls[0][1]?.body
        expect(form).toBeInstanceOf(FormData)

        expect(form.get('form[foo]')).toBe('bar')
        expect(form.get('form[bar][0]')).toBe('a')
        expect(form.get('form[bar][1]')).toBe('b')
        expect(form.get('form[bar][2]')).toBe('c')
        expect(form.get('form[baz]')).toBeInstanceOf(Blob)
    })

    it('Inject handleSubmitError', () => {
        mockFetch()
        const handler = jest.fn(({reject}) => reject('foo'))

        const promise = buildSubmitHandler({}, {handleSubmitError: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toBe('foo')
    })

    it('Default handleSubmitError', () => {
        const fetch = mockFetch('some error')

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).rejects.toBe('some error')
    })

    it('Inject handleSubmitResponse', () => {
        const fetch = mockFetch({})

        const handler = jest.fn(({resolve}) => resolve('foo'))

        const promise = buildSubmitHandler({}, {handleSubmitResponse: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Handle continue and server errors', () => {
        const fetch = mockFetch({
            status: 150,
            statusText: 'some status',
        })

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).rejects.toBe('some status')
    })

    it('Inject handleSubmitRedirectResponse', () => {
        const fetch = mockFetch({
            status: 350,
            statusText: 'some status',
        })

        const handler = jest.fn(({resolve}) => resolve('foo'))

        const promise = buildSubmitHandler({}, {handleSubmitRedirectResponse: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Default handleSubmitRedirectResponse', () => {
        const fetch = mockFetch({
            status: 350,
            statusText: 'some status',
        })

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toHaveProperty(FORM_ERROR)
    })

    it('Inject onSubmitRedirect', () => {
        const fetch = mockFetch({
            headers: {
                get: k => k === 'location' && 'some location',
            },
        })

        const handler = jest.fn(({resolve}) => resolve('foo'))

        const promise = buildSubmitHandler({}, {onSubmitRedirect: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Default onSubmitRedirect', () => {
        const fetch = mockFetch({
            headers: {
                get: k => k === 'location' && 'some location',
            },
        })
        const {location: {assign}} = mockDocument({location: {assign: jest.fn() }})

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).rejects.toMatch('location')
            .then(() => expect(assign).toBeCalledWith('some location'))
    })

    it('Inject onSubmitSuccess', () => {
        const fetch = mockFetch({
            ok: true,
            headers: {
                get: k => k === 'content-type' && 'application/json',
            },
            json: () => Promise.resolve({foo: 'bar'}),
        })

        const handler = jest.fn(({resolve}, data) => resolve(data))

        const promise = buildSubmitHandler({}, {onSubmitSuccess: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toEqual({foo: 'bar'})
    })

    it('Default onSubmitSuccess with meta.errors', () => {
        const newData = {
            meta: {
                errors: {
                    'foo.bar': ['There is an error'],
                },
            },
            values: {
                foo: 'some value',
            },
        }
        const fetch = mockFetch({
            ok: true,
            headers: {
                get: k => k === 'content-type' && 'application/json',
            },
            json: () => Promise.resolve(newData),
        })
        const updateData = jest.fn()

        const promise = buildSubmitHandler({updateData}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toHaveProperty(FORM_ERROR)
            .then(() => expect(updateData).toBeCalledWith(newData))
    })

    it('Default onSubmitSuccess without meta.errors', () => {
        const newData = {
            meta: {
            },
            values: {
                foo: 'some value',
            },
        }
        const fetch = mockFetch({
            ok: true,
            headers: {
                get: k => k === 'content-type' && 'application/json',
            },
            json: () => Promise.resolve(newData),
        })
        const updateData = jest.fn()

        const promise = buildSubmitHandler({updateData}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toBe(undefined)
            .then(() => expect(updateData).toBeCalledWith(newData))
    })

    it('Inject onSubmitFail', () => {
        const fetch = mockFetch({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'application/json',
            },
            json: () => Promise.resolve({foo: 'bar'}),
        })

        const handler = jest.fn(({resolve}, data) => resolve(data))

        const promise = buildSubmitHandler({}, {onSubmitFail: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toEqual({foo: 'bar'})
    })

    it('Default onSubmitFail', () => {
        const newData = {
            meta: {
                errors: {
                    'foo.bar': ['There is an error'],
                },
            },
            values: {
                foo: 'some value',
            },
        }
        const fetch = mockFetch({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'application/json',
            },
            json: () => Promise.resolve(newData),
        })
        const updateData = jest.fn()

        const promise = buildSubmitHandler({updateData}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toHaveProperty(FORM_ERROR)
            .then(() => expect(updateData).toBeCalledWith(newData))
    })

    it('Inject onSubmitHtmlResponse', () => {
        const fetch = mockFetch({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'text/html; charset=utf8',
            },
            text: () => Promise.resolve('foo'),
        })

        const handler = jest.fn(({resolve}, response) => response.text().then(data => resolve(data)))

        const promise = buildSubmitHandler({}, {onSubmitHtmlResponse: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Default onSubmitHtmlResponse', () => {
        const fetch = mockFetch({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'text/html; charset=utf8',
            },
            text: () => Promise.resolve('foo'),
        })

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).rejects.toMatch('HTML')
    })

    it('Reject unexpected content-type', () => {
        const fetch = mockFetch({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'foo',
            },
        })

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(fetch).toBeCalled()

        return expect(promise).rejects.toMatch('type')
    })

})
