import React, { useState } from 'react'

import {
  Playground,
  SkypackImportMap,
  SourceFile,
  BabelTypescriptTransform
} from 'react-esm-sandbox'

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
  const [files, setFiles] = useState([
    {
      path: 'index.tsx',
      contents: `import React from 'react';
import ReactDOM from 'react-dom';
import { Typography } from '@material-ui/core';
import { add, subtract } from './math/index.ts';

ReactDOM.render(
  <Typography>
    {add(50, subtract(20, 10))}
  </Typography>,
  document.body
)
`
    },
    {
      path: 'math/index.ts',
      contents: `export * from './add.ts'
export * from './subtract.ts'
`
    },
    {
      path: 'math/add.ts',
      contents: `export const add = (a: number, b: number) => a + b;`
    },
    {
      path: 'math/subtract.ts',
      contents: `export const subtract = (a: number, b: number) => a - b;`
    }
  ])
  const [active, setActive] = useState('index.tsx')

  const updateFile = (file: SourceFile) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.path === file.path) {
          return file
        }
        return f
      })
    )
  }

  return (
    <Playground
      active={active}
      onActiveChange={setActive}
      onLoading={() => console.log('loading')}
      onLoad={() => console.log('loaded')}
      onError={console.error}
      entrypoint='index.tsx'
      files={files}
      importMap={importMap}
      onLog={(data: any) => window.alert(JSON.stringify(data))}
      transforms={transforms}
      onFileChange={updateFile}
    />
  )
}

export default App
