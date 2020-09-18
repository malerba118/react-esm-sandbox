import React, { useEffect } from 'react'

import { ExampleComponent } from 'react-esm-sandbox'
import 'react-esm-sandbox/dist/index.css'

const App = () => {
  useEffect(() => {
    fetch('./blah/foo/bar')
  }, [])
  return <ExampleComponent text='Create React Library Example 😄' />
}

export default App
