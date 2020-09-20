import React from 'react'

import { Interpreter } from 'react-esm-sandbox/dist/interpreter'

const files = {
  'index.js': {
    contents: `
      import { add } from './add.js'; 
      alert(add(10, 40));
    `
  },
  'add.js': {
    contents: `
      export const add = (a, b) => { return a + b; };
    `
  }
}

const App = () => {
  return <Interpreter files={files} entrypoint='index.js' />
}

export default App
