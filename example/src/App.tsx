import React from 'react'

import {
  Interpreter,
  SkypackImportMap
} from 'react-esm-sandbox/dist/interpreter'

const files = {
  'index.ts': {
    contents: `
      import { add } from './add.js'; 
      import _ from 'lodash';

      const keys: string[] = Object.keys(_);

      alert(keys.join(', '));
    `
  },
  'add.ts': {
    contents: `
      export const add = (a: number, b: number): number => { return a + b; };
    `
  }
}

const importMap = SkypackImportMap({
  lodash: 'latest'
})

const App = () => {
  return (
    <Interpreter files={files} entrypoint='index.ts' importMap={importMap} />
  )
}

export default App
