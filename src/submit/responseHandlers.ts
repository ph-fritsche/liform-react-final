import { FORM_ERROR } from 'final-form'
import { LiformApi, LiformProps } from '../types'
import { PromiseCallbacks } from './types'

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ReactOnRails?: any
    }
}
export function onSubmitHtmlResponse(
    finalPromise: PromiseCallbacks,
    response: Response,
): void {
    response.text().then(html => {
        delete window.ReactOnRails

        const newDoc = window.document.open('text/html')
        newDoc.addEventListener('DOMContentLoaded', () => {
            /* istanbul ignore next */
            window.ReactOnRails?.reactOnRailsPageLoaded()
        })
        newDoc.write(html)
        newDoc.close()

        finalPromise.reject('Received new HTML')
    })
}

export function handleSubmitRedirectResponse(
    { resolve }: PromiseCallbacks,
): void {
    return resolve({ [FORM_ERROR]: 'The submit is redirected' })
}

export function onSubmitRedirect(
    { reject }: PromiseCallbacks,
    location: string,
): void {
    document.location.assign(location)
    reject('Received new location')
}

export function onSubmitResult(
    {resolve}: PromiseCallbacks,
    props: LiformProps,
    liform: LiformApi,
    response: Response,
): void {
    liform.updateData(props)
    resolve((
        (response.ok && !props.meta?.errors)
            ? undefined
            : { [FORM_ERROR]: 'The submit failed' }
    ))
}
