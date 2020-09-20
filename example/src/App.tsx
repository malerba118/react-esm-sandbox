import React from 'react'

import {
  Interpreter,
  SkypackImportMap
} from 'react-esm-sandbox/dist/interpreter'

const files = {
  'index.tsx': {
    contents: `
      import React from 'react'; 
      import ReactDOM from 'react-dom';
      import { App } from './components/App.tsx';

      ReactDOM.render(
        <App />,
        document.body
      );
    `
  },
  'components/App.tsx': {
    contents: `
      import React, { FC } from 'react'; 
      import { Button } from '@material-ui/core';

      export const App: FC = () => <Button>Hello World</Button>;
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
    <Interpreter entrypoint='index.tsx' files={files} importMap={importMap} />
  )
}

export default App
