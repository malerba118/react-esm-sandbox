import React from 'react'

import {
  Interpreter,
  SkypackImportMap
} from 'react-esm-sandbox/dist/interpreter'

const files = {
  'index.ts': {
    contents: `
      import { add, subtract } from './math/index.js';
      window.alert(subtract(add(40, 40), 20))
    `
  },
  'math/add.ts': {
    contents: `
      export const add = (a: number, b: number) => a + b;
    `
  },
  'math/subtract.ts': {
    contents: `
      export const subtract = (a: number, b: number) => a - b;
    `
  },
  'math/index.js': {
    contents: `
      export * from './add.ts'
      export * from './subtract.ts'
    `
  }
}

const importMap = SkypackImportMap({
  react: 'latest',
  'react-dom': 'latest',
  '@material-ui/core': 'latest'
})

const App = () => {
  return (
    <Interpreter entrypoint='index.ts' files={files} importMap={importMap} />
  )
}

export default App
