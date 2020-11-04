import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'

import { SourceFile } from '../../dist/interpreter'
import {
  Playground,
  PlaygroundLayout,
  GetEditorOptions
} from '../../dist/playground'

export default {
  title: 'Controlled Playground',
  component: Playground,
  argTypes: {}
} as Meta

const files: SourceFile[] = [
  {
    path: 'index.js',
    contents: `import { add } from './math.js'; 

console.log(add(10, 20));`
  },
  {
    path: 'math.js',
    contents: `export const add = (a, b) => a + b;`
  }
]

const Template: Story = (args) => {
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>(files)
  const [active, setActive] = useState<string>('index.js')

  const updateFile = (file: SourceFile) => {
    setSourceFiles((prev) =>
      prev.map((f) => {
        if (f.path === file.path) {
          return file
        }
        return f
      })
    )
  }

  const editorOptions: GetEditorOptions = () => ({
    readOnly: args.readOnly
  })

  return (
    <Playground
      layout={args.layout}
      active={active}
      onActiveChange={setActive}
      files={sourceFiles}
      entrypoint='index.js'
      onFileChange={updateFile}
      editorOptions={editorOptions}
      onLog={args.onLog}
      onLoading={args.onLoading}
      onLoad={args.onLoad}
      onError={args.onError}
    />
  )
}

export const Basic = Template.bind({})
Basic.args = {}

export const HorizontalLayout = Template.bind({})
HorizontalLayout.args = {
  layout: PlaygroundLayout.Horizontal,
  readOnly: false
}

export const ReadOnly = Template.bind({})
ReadOnly.args = {
  layout: PlaygroundLayout.Vertical,
  readOnly: true
}

export const Callbacks = Template.bind({})
Callbacks.args = {
  layout: PlaygroundLayout.Vertical,
  onLog: action('log'),
  onLoading: action('loading'),
  onLoad: action('load'),
  onError: action('error')
}
