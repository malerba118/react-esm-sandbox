import React, { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  useColorMode
} from '@chakra-ui/core'

import {
  Playground,
  SkypackImportMap,
  SourceFile,
  BabelTypescriptTransform
} from 'react-esm-sandbox'

const importMap = SkypackImportMap({
  react: 'latest',
  'react-dom': 'latest',
  'framer-motion': 'latest',
  'insert-css': 'latest'
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
import css from 'insert-css';
import Animation from './Animation.tsx';
import useInterval from './hooks/useInterval.ts';

console.error({
  foo: 1,
  bar: [0, 3, 5]
});

css(\`
  body {
    height: 100vh;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div {
    background: #4caf5e;
    border-radius: 30px;
    width: 100px;
    height: 100px;
  }
\`)

const App = () => {
  useInterval(() => {
    console.log({ timestamp: Date.now() })
  }, 1000)

  return <Animation />
}

ReactDOM.render(
  <App />,
  document.body
)
`
    },
    {
      path: 'Animation.tsx',
      contents: `import React from 'react'
import { motion } from 'framer-motion';

const Animation = () => {
  return (
    <motion.div
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 270, 270, 0],
        borderRadius: ["20%", "20%", "50%", "50%", "20%"]
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        loop: Infinity,
        repeatDelay: 1
      }}
    />
  );
};

export default Animation;
`
    },
    {
      path: 'hooks/useInterval.ts',
      contents: `import React from 'react';

export default function useInterval(callback, delay) {
  const intervalId = React.useRef(null);
  const savedCallback = React.useRef(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  });

  React.useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === 'number') {
      intervalId.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalId.current);
    }
  }, [delay]);

  return intervalId.current;
};`
    }
  ])
  const [active, setActive] = useState('index.tsx')
  const { setColorMode } = useColorMode()

  useEffect(() => {
    setColorMode('dark')
  }, [setColorMode])

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
    <Flex direction='column' h='100vh'>
      <Box
        h='64px'
        bg='gray.800'
        borderBottom={1}
        borderBottomStyle='solid'
        borderBottomColor='whiteAlpha.200'
      ></Box>
      <Box position='relative' flex={1} mr='50%' overflow='auto' p='12'>
        <Stack spacing={4}>
          <Heading size='lg'>React ESM Sandbox Demo</Heading>
          <Text size='sm'>
            react-esm-sandbox makes it super easy to bundle, transpile, and
            interpret es modules directly in the browser
          </Text>
          <Button>IDK</Button>
        </Stack>
        <Box position='fixed' top='64px' w='50%' right={0} bottom={0}>
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
            theme='dracula'
          />
        </Box>
      </Box>
    </Flex>
  )
}

export default App
