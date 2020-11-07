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
  TypescriptTransform,
  JavascriptTransform,
  CssTransform,
  Highlight,
  EditorGroup,
  PlaygroundLayout,
  useThemeColors
} from 'react-esm-sandbox'
// eslint-disable-next-line import/no-webpack-loader-syntax
import indexJsx from '!!raw-loader!./assets/index.txt'
// eslint-disable-next-line import/no-webpack-loader-syntax
import interactiveContainerJsx from '!!raw-loader!./assets/InteractiveContainer.txt'
// eslint-disable-next-line import/no-webpack-loader-syntax
import utilsJs from '!!raw-loader!./assets/utils.txt'
// eslint-disable-next-line import/no-webpack-loader-syntax
import useDataJs from '!!raw-loader!./assets/useData.txt'
// eslint-disable-next-line import/no-webpack-loader-syntax
import stylesCss from '!!raw-loader!./assets/styles.txt'

const importMap = SkypackImportMap({
  react: 'latest',
  'react-dom': 'latest',
  'framer-motion': 'latest'
})

const transforms = {
  jsx: JavascriptTransform(),
  ts: TypescriptTransform(),
  js: JavascriptTransform(),
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
      contents: indexJsx
    },
    {
      path: 'InteractiveContainer.jsx',
      contents: interactiveContainerJsx
    },
    {
      path: 'utils.js',
      contents: utilsJs
    },
    {
      path: 'useData.js',
      contents: useDataJs
    },
    {
      path: 'styles.css',
      contents: stylesCss
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
    (f) => f.path === 'InteractiveContainer.jsx'
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
            min={0.5}
            max={1.5}
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
