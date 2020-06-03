# liform-react-final

![tests](https://api.travis-ci.org/ph-fritsche/liform-react-final.svg?branch=master)

Library for generating React forms from [JSON schema](https://json-schema.org/) using [React Final Form](https://final-form.org/react).

This library is developed to work with [Pitch Liform](https://packagist.org/packages/pitch/liform) for rendering [Symfony Forms](https://symfony.com/doc/current/components/form.html).

# Installation

Install per npm from [npmjs.com](https://www.npmjs.com/package/liform-react-final).
```
npm install liform-react-final
```

Or use the dev version from [GitHub](https://github.com/ph-fritsche/liform-react-final).
```
npm install github:ph-fritsche/liform-react-final
```

# Basic usage

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Liform from 'liform-react-final';

const schema = {
    title: 'My super interesting new article form',
    properties: {
        topic: { type: 'string', title: 'Topic', 'placeholder': 'Enter some clickbait!' },
        description: { type: 'string', title: 'Content', 'widget': 'textarea' },
    },
    required:['name']
}

const initialMeta = {
    /* see below */
}

const initialValues = {
    description: 'You would not believe what I just discovered...\n\n',
}

ReactDom.render(
    <Liform name='article' schema={schema} meta={initialMeta} value={initialValues}/>,
    document.getElementById('form-container')
)
```
This will render the form in `#form-container`.

Once the user clicks the submit button and the values pass the validation the form value is sent to the server via `POST` request.

The server can report failure or success per HTTP status `2xx` or `4xx`.

For `application/json` responses with the form will be updated.
```js
{
    meta: {
        errors: {
            topic: [
                'This topic is not valid.',
                'Also there is this other error for topic.'
            ],
            /* more errors ...
            nested fields can also be reported: */
            'some.nested.field': [
                'Something went wrong here'
            ]
        },
        /* other meta data for the values */
    },
    value: /* the submitted value or something else to be used as new initial values */
}
```

For `text/html` responses a new document will be written.

If there is a location header e.g. for a `201 Created` response, the user will be redirected.

# Theme

A theme used by the `renderField` function in this library looks like this:
```jsx
const theme = {
    errors: myRenderErrorsFunction,
    field: {
        string: {
            render: myStringInputRender,
            someOption: 'foo',
        },
        someWidget: {
            component: 'textarea',
            placeholder: 'My placeholder text',
        },
        someComplexWidget: myComplexWidgetComponent,
    }
}
<Liform theme={theme}/>
```

For every field that has `schema.widget` the `renderField` reads the corresponding function or object from `theme.field`. `schema.widget` can be a string or an array of strings of which the first matching will apply.

If no matching entry can be found, `renderField` will try to find an entry for `schema.type`.

Entries that are a function will be called directly with the props `renderField` received and are responsible for setting up their [Final Fields](https://final-form.org/docs/react-final-form/api/Field) themselve.
Entries that are an object will passed as props to a [Final Field](https://final-form.org/docs/react-final-form/api/Field) and should contain a `render` or `component` property that is a render function, a [React component](https://reactjs.org/docs/react-component.html) or one of Final Forms basic components (`'input'`, `'select'` or `'textarea'`) which is responsible for rendering the field representation.

# Options

You can pass [Final Form FormProps](https://final-form.org/docs/react-final-form/types/FormProps) for manipulation the Final Form instance.
(`children`, `component`, `initialValues`, `onSubmit`, `render` and `validate` will be replaced though.)

#### Customize the `renderField` function

This is primarily useful for applying some code like a container element on every rendered field.
```jsx
import { renderField } from 'liform-react-final/src/field';

const myRenderField = (props) => (
    <div style={{border: "1px solid grey"}}>
        This is the field "{props.name}":
        { renderField(props) }
    </div>
)
<Liform {...otherProps} renderField={myRenderField}/>
```

#### Customize the submit handling
Prop name | | |
- | - | -
`action` | Url where the form data is sent to.
`prepareRequest` | Callback that will receive the values as first, the `LiformApi` as second and the default prepareRequest callback as third argument.<br/>Should return [fetch() init options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) object.
`handleSubmitResponse` | Callback that will receive the submit handling callbacks below, the callbacks for the [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
`handleSubmitError` | Callback that will receive the callbacks for the [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the error message.
`handleSubmitRedirectResponse` | Per definition `3xx` responses are neither failed nor completed, but require extra steps. If you want to handle those, define your callback here. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
`onSubmitRedirect` | This will be called when there is a location header. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise), the location and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
`onSubmitSuccess` | This will be called for successful `application/json` responses. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise), the response data and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
`onSubmitFail` | Like `onSubmitSuccess` but for failed (`4xx`) `application/json` responses.
`onSubmitHtmlResponse` | This will be called for HTML responses. It will receive the callbacks for [Final Form Submit Promise](https://final-form.org/docs/react-final-form/types/FormProps#3-asynchronous-with-a-promise) and the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

#### Customize the sections and container

Per default inside the Final Form Component, Liform renders a `<form>` container.
Inside that container it renders four children: `header` (empty), `form` (containing the fields according to schema), `footer` (containing errors that are global or don't have a corresponding field), `action` (containing a reset and a submit button).

You can replace any of these and add extra content like:
```jsx
<Liform>
    <header>
        This text will be rendered inside the <form> container, but above the fields.
        The <header> element is not part of the output.
    </header>
    <div>
        This text will be rendered inside the <form> container below everything else.
        The <div> element is part of the output.
    </div>
</Liform>
```
If you provide a function it will be called with the [Final Form FormRenderProps](https://final-form.org/docs/react-final-form/types/FormRenderProps) and a `liform` prop containing the `LiformApi`.
```jsx
<Liform>
    <header>{(renderProps) => renderProps.dirty ?
        'Submit the form when you are ready.' :
        'Edit some elements.'
    }</header>
</Liform>
```

You can replace all children:
```jsx
<Liform>{(renderProps) => "This will be the only thing inside <form>"}</Liform>
```

You can replace the container:
```jsx
<Liform render={(renderProps) => <div>{renderProps.children}</div>}/>
```

You can replace the sections (header, form, footer, action) with an own object.

```jsx
const mySections = {
    something: <div>foo</div>,
    form: myFormRenderFunction,
}
<Liform sections={mySections}>
    <something>This text will replace the something div.</something>
</Liform>
```
