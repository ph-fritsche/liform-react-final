---
nav_order: 11
---

# Default theme

The default theme provides a representation with native HTML elements that you can style per CSS or use as a starting point to provide your own theme.

## Sections

Per default inside the Final Form Component, Liform renders a `<form>` container.
Inside that container it renders four children:
* `header` - empty,
* `form` - containing the fields according to schema
* `footer` - containing errors that are global or don't have a corresponding field)
* `action` - containing a reset and a submit button

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

You can replace all sections with a function:
```jsx
<Liform>{(renderProps) => "This will be the only thing inside <form>"}</Liform>
```
