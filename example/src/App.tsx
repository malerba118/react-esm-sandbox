import React, { useState } from 'react'
import {
  Box,
  Stack,
  Heading,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormLabel
} from '@chakra-ui/core'
import 'codemirror/lib/codemirror.css'
// import 'codemirror/theme/dracula.css'
import 'codemirror/theme/seti.css'
import {
  Playground,
  SkypackImportMap,
  SourceFile,
  BabelTypescriptTransform,
  CssTransform,
  Highlight,
  EditorGroup,
  PlaygroundLayout,
  useThemeColors
} from 'react-esm-sandbox'

const importMap = SkypackImportMap({
  react: 'latest',
  'react-dom': 'latest',
  'framer-motion': 'latest'
})

const transforms = {
  jsx: BabelTypescriptTransform(),
  ts: BabelTypescriptTransform(),
  js: BabelTypescriptTransform(),
  css: CssTransform()
}

interface FileHighlight {
  filePath: string
  highlight: Highlight
}

const highlightExample: FileHighlight = {
  highlight: {
    lines: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    className: 'highlight'
  },
  filePath: 'index.jsx'
}

const App = () => {
  const [theme] = useState('seti')
  const [files, setFiles] = useState([
    {
      path: 'index.jsx',
      contents: `import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import InteractiveContainer from "./components/InteractiveContainer.jsx";
import useData from "./useData.js";
import "./styles.css";

const transition = { type: 'spring', damping: 50, stiffness: 250 }

function App() {
  const scale = useData()

  return (
    <InteractiveContainer animate={{ scale, transition }} className="image-container">
      <img
        className="image"
        src="https://picsum.photos/id/66/900/600"
        alt="kitten"
      />
    </InteractiveContainer>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
); 
`
    },
    {
      path: 'components/InteractiveContainer.jsx',
      contents: `import React from "react";
import { motion, useSpring } from "framer-motion";
import { getRelativeMousePosition } from "../utils.js";

export default function InteractiveContainer({ style, ...otherProps }) {
  const x = useSpring(0, { stiffness: 1000, damping: 50 });
  const y = useSpring(0, { stiffness: 1000, damping: 50 });

  const handleMouseMove = (e) => {
    const pos = getRelativeMousePosition(e);
    x.set(pos.x / 25);
    y.set(-pos.y / 25);
  };

  const handleMouseLeave = (e) => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      {...otherProps}
      style={{ rotateY: x, rotateX: y, perspective: 500, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}      
`
    },
    {
      path: 'utils.js',
      contents: `export const getRelativeMousePosition = (e) => {
  const el = e.currentTarget;
  const mousePosition = {
    x: e.pageX,
    y: e.pageY
  };
  const elementCenter = {
    x: el.offsetLeft + el.offsetWidth / 2,
    y: el.offsetTop + el.offsetHeight / 2
  };
  return {
    x: mousePosition.x - elementCenter.x,
    y: mousePosition.y - elementCenter.y
  };
};
`
    },
    {
      path: 'useData.js',
      contents: `import { useState, useEffect } from 'react';

const useData = () => {
  const [state, setState] = useState();

  useEffect(() => {
    const listener = (event) => {
      setState(event.data)
    };
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, []);
  
  return state;
};

export default useData;
`
    },
    {
      path: 'styles.css',
      contents: `html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
}

#root {
  padding: 36px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.image-container {
  height: 100%;
  width: 400px;
}

.image {
  height: 100%;
  width: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}
`
    }
  ])
  const [active, setActive] = useState('index.jsx')
  const [highlight, setHighlight] = useState<FileHighlight | null>(null)
  const [scale, setScale] = useState<number>(1)
  const colors = useThemeColors(theme)

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

  const utilsFile = files.find((f) => f.path === 'utils.js') as SourceFile
  const containerFile = files.find(
    (f) => f.path === 'components/InteractiveContainer.jsx'
  ) as SourceFile

  return (
    <>
      <Box
        className='tutorial'
        p={'4rem'}
        w='55%'
        position='relative'
        zIndex={100}
      >
        <Stack spacing={6}>
          <Heading size='lg'>React ESM Sandbox Demo</Heading>
          <Text size='sm'>
            In this mini tutorial, we'll build a special container that rotates
            on hover. Try hovering over the image to the right and take note of
            the effect.
          </Text>
          <Text size='sm'>
            In order to implement this effect, we'll need a utility that can get
            the mouse's position in relation to the center of the hovered
            element. Below is a code snippet to grab the mouse position. Try
            editing this file and see what happens.
          </Text>
          <EditorGroup
            theme={theme}
            className='inline-editor'
            active={utilsFile.path}
            files={[utilsFile]}
            onFileChange={(val) => {
              updateFile(val)
              setActive(val.path)
            }}
          />
          <Text size='sm'>
            Next, let's create a component that consumes the mouse position and
            performs rotations for us.
          </Text>
          <EditorGroup
            theme={theme}
            className='inline-editor'
            active={containerFile.path}
            files={[containerFile]}
            onFileChange={(val) => {
              updateFile(val)
              setActive(val.path)
            }}
          />
          <Text size='sm'>
            <span>
              On the right we consume InteractiveContainer in the Playground.{' '}
            </span>
            <span
              className={'highlightable'}
              onMouseEnter={() => {
                setActive('index.jsx')
                setHighlight(highlightExample)
              }}
              onMouseLeave={() => setHighlight(null)}
            >
              Try hovering over this to have a look at the App component where
              InteractiveContainer is used
            </span>
            .
          </Text>
          <Text size='sm'>
            Another neat thing about react-esm-sandbox is that you can
            communicate with the interpreter in real time. This slider is hooked
            up to control the scale of the image in the interpreter.
          </Text>
          <FormLabel>Image Scale</FormLabel>
          <Slider
            colorScheme='blue'
            defaultValue={scale}
            onChange={setScale}
            min={0.25}
            max={2.25}
            step={0.1}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb bg='blue.600' />
          </Slider>
        </Stack>
      </Box>
      <Box position='fixed' w='45%' top={0} right={0} bottom={0}>
        <Playground
          active={active}
          onActiveChange={setActive}
          onLoading={() => console.log('loading')}
          onLoad={() => console.log('loaded')}
          onError={(err: any) => {
            console.log({ message: err.message })
            console.log(Object.keys(err))
          }}
          entrypoint='index.jsx'
          files={files}
          importMap={importMap}
          onLog={(data: any) => window.alert(JSON.stringify(data))}
          transforms={transforms}
          onFileChange={updateFile}
          theme={theme}
          editorOptions={(file) => {
            const base = {}
            if (highlight && file.path === highlight.filePath) {
              return {
                ...base,
                highlight: highlight.highlight
              }
            }
            return base
          }}
          layout={PlaygroundLayout.Vertical}
          focusOnActivation={false}
          styles={{
            sandbox: {
              interpreter: {
                background: colors.background,
                borderTop: `3px solid ${colors.overlay}`
              },
              loading: {
                color: colors.foreground
              }
            }
          }}
          data={scale}
        />
      </Box>
    </>
  )
}

export default App
