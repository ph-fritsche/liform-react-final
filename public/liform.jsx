import React from 'react'
import ReactDOM from 'react-dom'
import Liform, { DefaultTheme } from '../src'

Liform.theme = DefaultTheme

import props from './props.json'

ReactDOM.render(
  <Liform {...props} name='form'>
    <footer>{(renderProps) => (
      <pre>
        <code>
          {JSON.stringify(renderProps.values, null, 2)}
        </code>
      </pre>
    )}</footer>
  </Liform>,
  document.getElementById('liform')
)