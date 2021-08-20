/* eslint-disable @typescript-eslint/no-explicit-any */

import { FORM_ERROR } from 'final-form'
import { FinalFormValue, LiformApi, LiformProps } from '../types'

type FinalSubmitResult = { [FORM_ERROR]: string } | undefined

export type PromiseCallbacks = {
    resolve: (value: FinalSubmitResult) => void
    reject: (reason: string) => void
}

export type SubmitHandlerBuilder = (
    liform: LiformApi,
    options: Partial<SubmitHandlerOptions & SubmitResponseHandlerCallbacks>,
) => SubmitHandler

export type SubmitHandler = (
    values: FinalFormValue<unknown>
) => Promise<FinalSubmitResult>

export type SubmitResultHandler<Value extends unknown = any> = (
    finalPromise: PromiseCallbacks,
    props: LiformProps<Value>,
    liform: LiformApi<Value>,
    response: Response,
) => void

export interface SubmitHandlerOptions {
    action: string
    prepareRequest: (
        values: unknown,
        liform: LiformApi,
    ) => RequestInit
    handleSubmitResponse: (
        finalPromise: PromiseCallbacks,
        response: Response,
        liform: LiformApi,
        callbacks: SubmitResponseHandlerCallbacks,
    ) => void
    handleSubmitError: (
        finalPromise: PromiseCallbacks,
        reason: string,
        action: string,
        request: RequestInit,
    ) => void
}

export interface SubmitResponseHandlerCallbacks {
    handleSubmitRedirectResponse: (p: PromiseCallbacks, r: Response) => void
    onSubmitHtmlResponse: (p: PromiseCallbacks, r: Response) => void
    onSubmitRedirect: (p: PromiseCallbacks, location: string, r: Response) => void
    onSubmitSuccess: SubmitResultHandler
    onSubmitFail: SubmitResultHandler
}
