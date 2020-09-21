# react-esm-sandbox

> ESM sandboxes

[![NPM](https://img.shields.io/npm/v/react-esm-sandbox.svg)](https://www.npmjs.com/package/react-esm-sandbox) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This is a library for interpreting sets of interdependent es modules directly in the browser. It also supports tanspilation of typescript/jsx via babel-standalone. This currently only works in firefox. Chrome has yet to implement iframe service worker iheritance according to the [w3c spec](https://github.com/w3c/ServiceWorker/issues/765). This library is on hold until then.

```tsx
import React from 'react'
import {
  Interpreter,
  SkypackImportMap
} from 'react-esm-sandbox/dist/interpreter'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(
      'react-esm-sandbox/dist/interpreter/service-worker.modern.js'
    );
  });
}

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
    <Interpreter 
      entrypoint='index.tsx' 
      files={files} 
      importMap={importMap} 
    />
  )
}

export default App
```

## License

MIT © [malerba118](https://github.com/malerba118)
