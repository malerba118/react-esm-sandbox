import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { SourceFile } from '../../dist/interpreter'
import { Playground, GetEditorOptions } from '../../dist/playground'

export default {
  title: 'Multiple Playground',
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
  const [sourceFiles2, setSourceFiles2] = useState<SourceFile[]>(files)

  const [active, setActive] = useState<string>('index.js')
  const [active2, setActive2] = useState<string>('index.js')

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

  const updateFile2 = (file: SourceFile) => {
    setSourceFiles2((prev) =>
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
    <>
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
      <br />
      <Playground
        layout={args.layout}
        active={active2}
        onActiveChange={setActive2}
        files={sourceFiles2}
        entrypoint='index.js'
        onFileChange={updateFile2}
        editorOptions={editorOptions}
        onLog={args.onLog}
        onLoading={args.onLoading}
        onLoad={args.onLoad}
        onError={args.onError}
      />
    </>
  )
}

export const Basic = Template.bind({})
Basic.args = {}
