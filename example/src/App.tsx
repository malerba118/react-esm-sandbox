import React, { useEffect } from 'react'

import { Interpreter } from 'react-esm-sandbox/dist/interpreter'

const files = {
  'index.js': {
    contents: `import { add } from './add.js'; console.log(add(10, 20));`
  },
  'add.js': {
    contents: `export const add = (a, b) => { return a + b; };`
  }
}

const App = () => {
  useEffect(() => {
    fetch('./blah/foo/bar')
  }, [])
  return <Interpreter files={files} />
}

export default App
