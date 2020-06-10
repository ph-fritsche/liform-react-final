import { FORM_ERROR } from "final-form"

const prepareRequestDefault = (values, liform) => { return {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify({[liform.rootName]: values}),
}}

const handleSubmitErrorDefault = ({reject}, reason) => {
    reject(reason)
}

const handleSubmitResponseDefault = ({handleSubmitRedirectResponse, onSubmitHtmlResponse, onSubmitRedirect, onSubmitSuccess, onSubmitFail}, finalPromise, response) => {
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
            response.ok ? onSubmitSuccess(finalPromise, props, response) : onSubmitFail(finalPromise, props, response)
        })
    } else if (responseType === 'text/html') {
        onSubmitHtmlResponse(finalPromise, response)
    } else {
        finalPromise.reject('Unexpected response type')
    }
}

const onSubmitHtmlResponseDefault = (finalPromise, response) => {
    response.text().then(html => {
        delete window.ReactOnRails

        const newDoc = window.document.open('text/html')
        newDoc.addEventListener("DOMContentLoaded", () => {
            window.ReactOnRails && window.ReactOnRails.reactOnRailsPageLoaded()
        })
        newDoc.write(html)
        newDoc.close()

        finalPromise.reject('Received new HTML')
    })
}

const handleSubmitRedirectResponseDefault = ({},{resolve}) => {
    return resolve({ [FORM_ERROR]: 'The submit is redirected' })
}

const onSubmitRedirectDefault = (finalPromise, location) => {
    document.location.assign(location)
    finalPromise.reject('Received new location')
}

const onSubmitResult = (liform, finalPromise, props, response) => {
    liform.updateData(props)
    finalPromise.resolve(response.ok ? { [FORM_ERROR]: 'The submit failed' } : undefined)
}

export const buildSubmitHandler = (liform, {action, prepareRequest, ...props}) => {
    const responseCallbacks = {
        handleSubmitRedirectResponse: props.handleSubmitRedirectResponse || handleSubmitRedirectResponseDefault,
        onSubmitRedirect: props.onSubmitRedirect || onSubmitRedirectDefault,
        onSubmitHtmlResponse: props.onSubmitHtmlResponse || onSubmitHtmlResponseDefault,
        onSubmitSuccess: props.onSubmitSuccess || onSubmitResult.bind(undefined, liform),
        onSubmitFail: props.onSubmitFail || onSubmitResult.bind(undefined, liform),
    }

    return (values) => {
        return new Promise((resolve, reject) => {
            fetch(
                action || '',
                prepareRequest ? prepareRequest(values, liform, prepareRequestDefault) : prepareRequestDefault(values, liform)
            ).then(
                response => (props.handleSubmitResponse || handleSubmitResponseDefault)(responseCallbacks, {resolve, reject}, response),
                reason => (props.handleSubmitError || handleSubmitErrorDefault)({resolve, reject}, reason)
            )
        })
    }
}
  
  