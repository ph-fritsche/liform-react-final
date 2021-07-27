import { useMemo } from 'react'
import { FORM_ERROR } from 'final-form'
import { LiformApi } from '../types'
import * as defaultPrepareRequest from './prepareRequest'
import * as defaultResponseHandlers from './responseHandlers'
import * as defaultSubmitHandlers from './submitHandlers'
import { SubmitHandler, SubmitHandlerBuilder, SubmitHandlerOptions, SubmitResponseHandlerCallbacks, SubmitResultHandler } from './types'

export function buildSubmitHandler(
    liform: LiformApi,
    {
        action = '',
        prepareRequest = defaultPrepareRequest.prepareRequest,
        handleSubmitError = defaultSubmitHandlers.handleSubmitError,
        handleSubmitResponse = defaultSubmitHandlers.handleSubmitResponse,
        ...responseHandlers
    }: Partial<SubmitHandlerOptions & SubmitResponseHandlerCallbacks>,
): (values: {_: unknown}) => Promise<{[FORM_ERROR]: string}|undefined> {
    const { onSubmitResult, ...otherDefaultHandlers } = defaultResponseHandlers
    const responseCallbacks = {
        ...otherDefaultHandlers,
        onSubmitSuccess: onSubmitResult,
        onSubmitFail: onSubmitResult,
        ...responseHandlers,
    }

    return (values: {_: unknown}) => {
        const liformValue = values?._
        const request = prepareRequest(liformValue, liform)

        return new Promise((resolve, reject) => {
            fetch(action, request).then(
                response => handleSubmitResponse({ resolve, reject }, response, liform, responseCallbacks),
                reason => handleSubmitError({ resolve, reject }, reason, action, request),
            )
        })
    }
}

export function useSubmitHandler(
    liform: LiformApi,
    {
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
    }: Partial<SubmitHandlerOptions & SubmitResponseHandlerCallbacks & {
        buildSubmitHandler: SubmitHandlerBuilder
        onSubmitResult: SubmitResultHandler
    }> = {},
): SubmitHandler {
    return useMemo(() => buildFn(liform, {
        action,
        prepareRequest,
        handleSubmitError,
        handleSubmitResponse,
        handleSubmitRedirectResponse,
        onSubmitRedirect,
        onSubmitHtmlResponse,
        onSubmitSuccess: onSubmitSuccess || onSubmitResult,
        onSubmitFail: onSubmitFail || onSubmitResult,
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
