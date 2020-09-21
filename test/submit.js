import { buildSubmitHandler } from '../src/submit'
import { FORM_ERROR } from 'final-form'

let realDocument

beforeEach(() => {
    realDocument = global.document
})

afterEach(() => {
    global.document = realDocument
})

describe('Submit handler', () => {
    it('Inject prepareRequest', () => {
        global.fetch = jest.fn(() => Promise.reject('some error'))

        const handler = jest.fn(() => ({}))

        const liform = {}
        const promise = buildSubmitHandler(liform, {prepareRequest: handler})({_: 'foo'})

        expect(handler).toBeCalled()
        expect(handler.mock.calls[0][0]).toBe('foo')
        expect(handler.mock.calls[0][1]).toBe(liform)

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return promise.catch(() => {})
    })

    it('Inject handleSubmitError', () => {
        global.fetch = jest.fn(() => Promise.reject('some error'))

        const handler = jest.fn(({reject}) => reject('foo'))

        const promise = buildSubmitHandler({}, {handleSubmitError: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toBe('foo')
    })

    it('Default handleSubmitError', () => {
        global.fetch = jest.fn(() => Promise.reject('some error'))

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toBe('some error')
    })

    it('Inject handleSubmitResponse', () => {
        global.fetch = jest.fn(() => Promise.resolve())

        const handler = jest.fn((handlers, {resolve}) => resolve('foo'))

        const promise = buildSubmitHandler({}, {handleSubmitResponse: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Handle continue and server errors', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 150,
            statusText: 'some status'
        }))

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toBe('some status')
    })

    it('Inject handleSubmitRedirectResponse', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 350,
            statusText: 'some status'
        }))

        const handler = jest.fn(({resolve}) => resolve('foo'))

        const promise = buildSubmitHandler({}, {handleSubmitRedirectResponse: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Default handleSubmitRedirectResponse', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            status: 350,
            statusText: 'some status',
        }))

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toHaveProperty(FORM_ERROR)
    })

    it('Inject onSubmitRedirect', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            headers: {
                get: k => k === 'location' && 'some location'
            },
        }))

        const handler = jest.fn(({resolve}) => resolve('foo'))

        const promise = buildSubmitHandler({}, {onSubmitRedirect: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Default onSubmitRedirect', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            headers: {
                get: k => k === 'location' && 'some location'
            },
        }))
        delete global.document
        global.document = {location: {assign: jest.fn() }}

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toMatch('location')
            .then(() => expect(global.document.location.assign).toBeCalledWith('some location'))
    })

    it('Inject onSubmitSuccess', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            headers: {
                get: k => k === 'content-type' && 'application/json'
            },
            json: () => Promise.resolve({foo: 'bar'})
        }))

        const handler = jest.fn(({resolve}, data) => resolve(data))

        const promise = buildSubmitHandler({}, {onSubmitSuccess: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toEqual({foo: 'bar'})
    })

    it('Default onSubmitSuccess with meta.errors', () => {
        const newData = {
            meta: {
                errors: {
                    'foo.bar': ['There is an error'],
                }
            },
            values: {
                foo: 'some value',
            },
        }
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            headers: {
                get: k => k === 'content-type' && 'application/json'
            },
            json: () => Promise.resolve(newData)
        }))
        const updateData = jest.fn()

        const promise = buildSubmitHandler({updateData}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

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
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            headers: {
                get: k => k === 'content-type' && 'application/json'
            },
            json: () => Promise.resolve(newData)
        }))
        const updateData = jest.fn()

        const promise = buildSubmitHandler({updateData}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toBe(undefined)
            .then(() => expect(updateData).toBeCalledWith(newData))
    })

    it('Inject onSubmitFail', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'application/json'
            },
            json: () => Promise.resolve({foo: 'bar'})
        }))

        const handler = jest.fn(({resolve}, data) => resolve(data))

        const promise = buildSubmitHandler({}, {onSubmitFail: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toEqual({foo: 'bar'})
    })

    it('Default onSubmitFail', () => {
        const newData = {
            meta: {
                errors: {
                    'foo.bar': ['There is an error'],
                }
            },
            values: {
                foo: 'some value',
            },
        }
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'application/json'
            },
            json: () => Promise.resolve(newData)
        }))
        const updateData = jest.fn()

        const promise = buildSubmitHandler({updateData}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toHaveProperty(FORM_ERROR)
            .then(() => expect(updateData).toBeCalledWith(newData))
    })

    it('Inject onSubmitHtmlResponse', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'text/html; charset=utf8'
            },
            text: () => Promise.resolve('foo')
        }))

        const handler = jest.fn(({resolve}, response) => response.text().then(data => resolve(data)))

        const promise = buildSubmitHandler({}, {onSubmitHtmlResponse: handler})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).resolves.toBe('foo')
    })

    it('Default onSubmitHtmlResponse', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'text/html; charset=utf8'
            },
            text: () => Promise.resolve('foo')
        }))

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toMatch('HTML')
    })

    it('Reject unexpected content-type', () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            headers: {
                get: k => k === 'content-type' && 'foo'
            },
        }))

        const promise = buildSubmitHandler({}, {})({_: undefined})

        expect(promise).toBeInstanceOf(Promise)
        expect(global.fetch).toBeCalled()

        return expect(promise).rejects.toMatch('type')
    })

})
