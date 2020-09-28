import React from 'react'

import { Interpreter, SkypackImportMap } from 'react-esm-sandbox/interpreter'

const files = [
  {
    path: 'index.js',
    contents: `
      import React from 'react';
      import ReactDOM from 'react-dom';
      import { Typography } from '@material-ui/core';
      import { add, subtract } from './math/index.js';

      console.log('testtt')
    `
  },
  {
    path: 'math/add.js',
    contents: `
      export const add = (a, b) => a + b;
    `
  },
  {
    path: 'math/subtract.js',
    contents: `
      export const subtract = (a, b) => a - b;
    `
  },
  {
    path: 'math/index.js',
    contents: `
      export * from './add.js'
      export * from './subtract.js'
    `
  }
]

const importMap = SkypackImportMap({
  react: 'latest',
  'react-dom': 'latest',
  '@material-ui/core': 'latest'
})

const App = () => {
  return (
    <Interpreter
      onLoading={() => console.log('loading')}
      onLoad={() => console.log('loaded')}
      entrypoint='index.js'
      files={files}
      importMap={importMap}
      onLog={(data) => window.alert(JSON.stringify(data))}
    />
  )
}

export default App
