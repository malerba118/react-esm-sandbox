import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { SourceFile } from '../../dist/interpreter'
import { Sandbox } from '../../dist/sandbox'

export default {
  title: 'Sandbox',
  component: Sandbox,
  argTypes: {}
} as Meta

const files: SourceFile[] = [
  {
    path: 'index.js',
    contents: `import { add } from './math.js'; 
document.body.style = "background: beige; border: 8px dashed orange; height: 100vh; box-sizing: border-box; margin: 0;"
console.log(add(10, 20));`
  },
  {
    path: 'math.js',
    contents: `export const add = (a, b) => a + b;`
  }
]

const Template: Story = (args) => {
  return (
    <Sandbox
      files={files}
      entrypoint='index.js'
      onLog={args.onLog}
      onLoading={args.onLoading}
      onLoad={args.onLoad}
      onError={args.onError}
      components={args.components}
    />
  )
}

export const Basic = Template.bind({})
Basic.args = {
  onLog: action('log'),
  onLoading: action('loading'),
  onLoad: action('load'),
  onError: action('error')
}

export const NoConsole = Template.bind({})
NoConsole.args = {
  onLog: action('log'),
  onLoading: action('loading'),
  onLoad: action('load'),
  onError: action('error'),
  components: {
    console: null
  }
}

export const NoLoading = Template.bind({})
NoLoading.args = {
  onLog: action('log'),
  onLoading: action('loading'),
  onLoad: action('load'),
  onError: action('error'),
  components: {
    loading: null
  }
}
