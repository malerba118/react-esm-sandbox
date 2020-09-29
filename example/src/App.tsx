import React from 'react'

import { Interpreter, SkypackImportMap } from 'react-esm-sandbox/interpreter'
import { BabelTypescriptTransform } from 'react-esm-sandbox/transforms'

const files = [
  {
    path: 'index.tsx',
    contents: `
      import React from 'react';
      import ReactDOM from 'react-dom';
      import { Typography } from '@material-ui/core';
      import { add, subtract } from './math/index.js';

      ReactDOM.render(<Typography>{add(50, subtract(20, 10))}</Typography>, document.body)
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

const transforms = {
  tsx: BabelTypescriptTransform(),
  ts: BabelTypescriptTransform()
}

const App = () => {
  return (
    <Interpreter
      onLoading={() => console.log('loading')}
      onLoad={() => console.log('loaded')}
      entrypoint='index.tsx'
      files={files}
      importMap={importMap}
      onLog={(data: any) => window.alert(JSON.stringify(data))}
      transforms={transforms}
    />
  )
}

export default App
