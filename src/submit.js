import PropTypes from 'prop-types'
import { FORM_ERROR } from 'final-form'
import { htmlizeName } from './util'
import { useMemo } from 'react'
import { filterObject } from 'liform-util'

export const defaultHandlers = {
    prepareRequest (values, liform) {
        let multipart = false
        const form = new FormData()

        function walk(val, path = ['_']) {
            if (Array.isArray(val)) {
                val.forEach((v, i) => walk(v, path.concat(i)))
            } else if (typeof val === 'object' && Object.getPrototypeOf(val).constructor === Object) {
                Object.keys(val).forEach(k => walk(val[k], path.concat(k)))
            } else {
                if (typeof val === 'object') {
                    if (val instanceof Blob) {
                        multipart = true
                    }
                }
                const key = htmlizeName(path.join('.'), liform.rootName)
                form.append(key, val)
            }
        }
        walk(values)

        return multipart
            ? {
                method: 'POST',
                body: form,
            }
            : {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ [liform.rootName]: values }),
            }
    },

    handleSubmitError ({reject}, reason) {
        reject(reason)
    },

    handleSubmitResponse (finalPromise, response, liform, handlers) {
        const {
            handleSubmitRedirectResponse,
            onSubmitHtmlResponse,
            onSubmitRedirect,
            onSubmitResult,
            onSubmitSuccess = onSubmitResult,
            onSubmitFail = onSubmitResult,
        } = handlers

        if (response.status <= 199 || response.status >= 500) {
            return finalPromise.reject(response.statusText)
        }

        if (response.status >= 300 && response.status <= 399) {
            return handleSubmitRedirectResponse(finalPromise, response)
        }

        const contentType = String(response.headers.get('content-type'))
        const p = contentType.indexOf(';')
        const responseType = contentType.substr(0, p >= 0 ? p : undefined)

        const location = response.headers.get('location')

        if (location) {
            onSubmitRedirect(finalPromise, location, response)
        } else if (responseType === 'application/json') {
            response.json().then(props => {
                response.ok
                    ? onSubmitSuccess(finalPromise, props, liform, response)
                    : onSubmitFail(finalPromise, props, liform, response)
            })
        } else if (responseType === 'text/html') {
            onSubmitHtmlResponse(finalPromise, response)
        } else {
            finalPromise.reject('Unexpected response type')
        }
    },

    onSubmitHtmlResponse (finalPromise, response) {
        response.text().then(html => {
            delete window.ReactOnRails

            const newDoc = window.document.open('text/html')
            newDoc.addEventListener('DOMContentLoaded', () => {
                /* istanbul ignore next */
                window.ReactOnRails && window.ReactOnRails.reactOnRailsPageLoaded()
            })
            newDoc.write(html)
            newDoc.close()

            finalPromise.reject('Received new HTML')
        })
    },

    handleSubmitRedirectResponse ({resolve}) {
        return resolve({ [FORM_ERROR]: 'The submit is redirected' })
    },

    onSubmitRedirect (finalPromise, location) {
        document.location.assign(location)
        finalPromise.reject('Received new location')
    },

    onSubmitResult (finalPromise, props, liform, response) {
        liform.updateData(props)
        finalPromise.resolve((response.ok && (!props.meta || !props.meta.errors))? undefined : { [FORM_ERROR]: 'The submit failed' })
    },
}

export function buildSubmitHandler (liform, {action = '', ...handlers}) {
    const effectiveHandlers = { ...defaultHandlers, ...filterObject(handlers, v => typeof(v) === 'function') }
    const {
        prepareRequest,
        handleSubmitResponse,
        handleSubmitError,
    } = effectiveHandlers

    return (values) => {
        const liformValue = values?._
        const request = prepareRequest(liformValue, liform, defaultHandlers.prepareRequest)

        return new Promise((resolve, reject) => {
            fetch(action, request).then(
                response => handleSubmitResponse({ resolve, reject }, response, liform, effectiveHandlers),
                reason => handleSubmitError({resolve, reject}, reason, action, request),
            )
        })
    }
}

export const buildSubmitHandlerProps = {
    action: PropTypes.string,
    prepareRequest: PropTypes.func,
    handleSubmitError: PropTypes.func,
    handleSubmitResponse: PropTypes.func,
    handleSubmitRedirectResponse: PropTypes.func,
    onSubmitRedirect: PropTypes.func,
    onSubmitHtmlResponse: PropTypes.func,
    onSubmitResult: PropTypes.func,
    onSubmitSuccess: PropTypes.func,
    onSubmitFail: PropTypes.func,
}

export function useSubmitHandler(liform, {
    buildSubmitHandler: buildFn = buildSubmitHandler,
    action,
    prepareRequest,
    handleSubmitError,
    handleSubmitResponse,
    handleSubmitRedirectResponse,
    onSubmitRedirect,
    onSubmitHtmlResponse,
    onSubmitResult,
    onSubmitSuccess,
    onSubmitFail,
} = {}) {
    return useMemo(() => buildFn(liform, {
        action,
        prepareRequest,
        handleSubmitError,
        handleSubmitResponse,
        handleSubmitRedirectResponse,
        onSubmitRedirect,
        onSubmitHtmlResponse,
        onSubmitResult,
        onSubmitSuccess,
        onSubmitFail,
    }), [
        buildFn,
        liform,
        action,
        prepareRequest,
        handleSubmitError,
        handleSubmitResponse,
        handleSubmitRedirectResponse,
        onSubmitRedirect,
        onSubmitHtmlResponse,
        onSubmitResult,
        onSubmitSuccess,
        onSubmitFail,
    ])
}
