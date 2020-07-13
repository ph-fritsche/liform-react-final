---
nav_order: 0
---

# Getting started

## Installation

Install per [Yarn](https://yarnpkg.com/) from [npmjs.com](https://www.npmjs.com/package/liform-react-final).
```
yarn add liform-react-final
```

## Usage

Pass the [Liform props](https://ph-fritsche.github.io/liform-react-final/liform-props) object created by [Pitch Liform](https://github.com/ph-fritsche/liform) (or by other means) to the `Liform` component.

###### With the default theme

```jsx
import Liform from 'liform-react-final'

<Liform {...liformProps}/>
```

###### With another theme

```jsx
import { Liform } from 'liform-react-final'
import theme from 'liform-material'

<Liform {...liformProps} theme={theme}/>
```

##### Render into DOM

```jsx
import ReactDOM from 'react-dom';

ReactDom.render(
    <Liform {...liformProps}/>,
    document.getElementById('form-container')
)
```

This will render the form in `#form-container`.

Once the user clicks the submit button and the values pass the validation the form value is sent to the server via `POST` request.

The server can report failure or success per HTTP status `2xx` or `4xx`.

For `application/json` responses with a new [Liform props](https://ph-fritsche.github.io/liform-react-final/liform-props) object the form will be updated.

For `text/html` responses a new document will be written.

If there is a location header e.g. for a `201 Created` response, the user will be redirected.
