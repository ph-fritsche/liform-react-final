# Validation handling

By default __Liform React Final__ validates the values against `schema` per [Ajv](https://github.com/ajv-validator/ajv).

It reports validation errors as flat error object under `liform.validationErrors` and unpacks per [Field `validate`](https://final-form.org/docs/react-final-form/types/FieldProps#validate) and `renderFinalForm`.

You can provide your own Ajv instance per `ajv` prop.
```jsx
import Ajv from 'ajv'

<Liform {...liformProps} ajv={new Ajv({
    // my config...
})}/>
```

You can provide a translation function to change representation of errors per `ajvTranslator` prop.
```jsx
<Liform {...liformProps} ajvTranslator={
    (ajvErrorObject) => {
        //...
        return {
            fieldName: flattenedFieldName,
            message: myErrorMessage,
        }
    }
}/>
```

You can add errors on top of the schema validation by injecting your own validator.
```jsx
const myValidator = (values, liformApi) => {
    // inspect the values and return a flat error object
    return {
        'my.object.property': 'some error',
    }
}
<Liform {...liformProps} validate={myValidator}/>
```
