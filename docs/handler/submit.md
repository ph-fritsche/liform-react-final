# Submit handling

If you want __Liform React Final__ to just display your [Symfony Form](https://symfony.com/doc/current/components/form.html) and send back the data, you are already done here.

Just return a `201` (or any other `2xx`) status with a `Location` header pointing to another endpoint when you are satisfied, or report errors with `4xx` status.

If you want to hook in on the submit handling on the client side you can use the following callbacks:

| Prop name | Description |
| --- | --- |
`action` | Url where the form data is sent to.
`prepareRequest` | Callback that will receive the values as first, the `LiformApi` as second and the default prepareRequest callback as third argument.<br/>Should return [fetch() init options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) object.
`handleSubmitResponse` | Callback that will receive the submit handling callbacks below, the callbacks for the [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
`handleSubmitError` | Callback that will receive the callbacks for the [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the error message.
`handleSubmitRedirectResponse` | Per definition `3xx` responses are neither failed nor completed, but require extra steps. If you want to handle those, define your callback here. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
`onSubmitRedirect` | This will be called when there is a location header. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise), the location and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
`onSubmitSuccess` | This will be called for successful `application/json` responses. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise), the response data and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
`onSubmitFail` | Like `onSubmitSuccess` but for failed (`4xx`) `application/json` responses.
`onSubmitHtmlResponse` | This will be called for HTML responses. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

---

If you don't like the submit handling by this library at all, you can replace it altogether per `buildSubmitHandler` prop:
```jsx
<Liform {...liformProps} buildSubmitHandler={myBuildSubmitHandler}/>
```

