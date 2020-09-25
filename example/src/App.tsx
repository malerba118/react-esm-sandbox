import React from 'react'

import {
  Interpreter,
  SkypackImportMap
} from 'react-esm-sandbox/dist/interpreter'

const files = [
  {
    path: 'index.ts',
    contents: `
      import React from 'react';
      import ReactDOM from 'react-dom';
      import { Typography } from '@material-ui/core';
      import { add, subtract } from './math/index.js';

      ReactDOM.render(
        <Typography>{subtract(add(40, 40), 20)}</Typography>, 
        document.body
      );
    `
  },
  {
    path: 'math/add.ts',
    contents: `
      export const add = (a: number, b: number) => a + b;
    `
  },
  {
    path: 'math/subtract.ts',
    contents: `
      export const subtract = (a: number, b: number) => a - b;
    `
  },
  {
    path: 'math/index.js',
    contents: `
      export * from './add.ts'
      export * from './subtract.ts'
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
      entrypoint='index.ts'
      files={files}
      importMap={importMap}
    />
  )
}

export default App
