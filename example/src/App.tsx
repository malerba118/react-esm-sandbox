import React from 'react'

import {
  Interpreter,
  SkypackImportMap
} from 'react-esm-sandbox/dist/interpreter'

const files = {
  'index.js': {
    contents: `
      import { add } from './add.js'; 
      import _ from 'lodash';
      alert(Object.keys(_).join(', '));
    `
  },
  'add.js': {
    contents: `
      export const add = (a, b) => { return a + b; };
    `
  }
}

const importMap = SkypackImportMap({
  lodash: 'latest'
})

const App = () => {
  return (
    <Interpreter files={files} entrypoint='index.js' importMap={importMap} />
  )
}

export default App
