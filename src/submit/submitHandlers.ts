import { LiformApi } from '../types'
import { PromiseCallbacks, SubmitResultHandler } from './types'

export function handleSubmitError(
    { reject }: PromiseCallbacks,
    reason: string,
): void {
    reject(reason)
}

export function handleSubmitResponse(
    finalPromise: PromiseCallbacks,
    response: Response,
    liform: LiformApi,
    {
        handleSubmitRedirectResponse,
        onSubmitHtmlResponse,
        onSubmitRedirect,
        onSubmitSuccess,
        onSubmitFail,
    }: {
        handleSubmitRedirectResponse: (p: PromiseCallbacks, r: Response) => void
        onSubmitHtmlResponse: (p: PromiseCallbacks, r: Response) => void
        onSubmitRedirect: (p: PromiseCallbacks, location: string, r: Response) => void
        onSubmitSuccess: SubmitResultHandler
        onSubmitFail: SubmitResultHandler
    },
): void {
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
}
