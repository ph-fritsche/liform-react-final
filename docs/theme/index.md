# Theme

Every code coupling __Liform React Final__ with a concrete UI representation lives inside the theme so that you can replace it with components to your liking.

## Container

The minimal valid theme looks like this:

```js
const theme = {
    render: {
        container: props => <form>{props.children}</form>
    }
}
```

`theme.render.container` will be called by `<Liform>` with Final Form's [`FormRenderProps`](https://final-form.org/docs/react-final-form/types/FormRenderProps), the `LiformContext` object providing state and callbacks for Liform as well as the compiled children.

## Field

The `theme.render.field` callback should be part of any theme.
```js
import { renderField } from 'liform-react-final'
const theme = {
    render: {
        field: renderField,
        //...
    }
}
```

Components receiving `liform` per prop or `LiformContext` can relay rendering of fields per `liform.render.field(props)` to that function.

The default implementation `renderField` tries to find an appropriate component configuration in `theme.field`. It searches for the the field's `schema.widget` (or each of its elements if it is an array) and `schema.type`.

```js
const theme = {
    field: {
        string: {
            render: myStringRenderer,
            additionalProp: 'foo',
        },
        special: mySpecialWidget,
    },
    //...
}
```

If the found configuration is a function it will be called with the props as received by `renderField`.

If the found configuration is an object `renderField` renders a Final Form's [`Field`](https://final-form.org/docs/react-final-form/api/Field).
Object configurations need a `render` or `component` property or `renderField` needs to be called with `props.children`.
`props.children` receive the unfiltered Final Form [`FieldRenderProps`](https://final-form.org/docs/react-final-form/types/FieldRenderProps) while `render`/`component` receive adjusted props.
(Both receive any additional props provided per `renderField` or `theme.field` configuration.)

### Field render

Inside Final Form's [`Field`](https://final-form.org/docs/react-final-form/api/Field) `renderFinalField` is used to adjust props.
If you need to render a [`Field`](https://final-form.org/docs/react-final-form/api/Field) in a special widget function yourself, use it to provide the same features.

* It adds the field name as used by Final Form as extra prop and changes `input.name` to a pure HTML form format.

* It corrects `input.value` to not violate `schema.type`.

* It changes `meta.error` to match `liform.validationErrors` (if dirty) or `liform.meta.errors` (if pristine) for the field.
As __Liform React Final__ provides flat error handling, this makes `meta.error` an array if truthy and works also for arrays and objects with children.

## Sections

If `props.children` is not a function, the `<Liform>` component compiles the children to pass to the container from `props.children`.

A theme can provide `sections` to use as basis for this transformation.

```js
{
    sections: {
        foo: undefined,
        bar: <div>Important notice</div>,
        baz: props => <div>Some runtime content</div>
    }
}
```

When calling `<Liform>` in different parts of your App, you can adjust representation as simple as:
```jsx
<Liform {...liformProps} theme={myThemeWithSections}>
    <foo>Something local</foo>
</Liform>
```
Leading to a representation roughly like:
```jsx
<Liform...>
    <FinalForm...>
        <render.container...>
            <foo>Something local</foo>
            <div>Important notice</div>
            <div>Some runtime content</div>
        </render.container>
    </FinalForm>
</Liform>
```

*Don't forget that at some point your theme should render the actual form though. ;)*

