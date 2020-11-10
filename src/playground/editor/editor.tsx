import React, { useRef, useEffect, FC } from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/jsx/jsx.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/theme/dracula.css'
import { Controlled as Codemirror } from 'react-codemirror2'
import { Editor as CodeMirrorEditor, EditorConfiguration } from 'codemirror'
import classnames from 'classnames'
import _classes from './editor.module.css'

export interface Highlight {
  lines: number[]
  className: string
}

interface EditorProps {
  value: string
  onChange: (val: string) => void
  theme?: string
  classes?: {
    root?: string
  }
  handles?: {
    root?: (handle: CodeMirrorEditor | null) => void
  }
  highlight?: Highlight
  tabSize?: number
  mode?: EditorConfiguration['mode']
  lineNumbers?: boolean
  readOnly?: boolean
}

export const Editor: FC<EditorProps> = ({
  value,
  onChange,
  theme = 'dracula',
  classes,
  handles,
  highlight,
  tabSize = 2,
  lineNumbers,
  mode,
  readOnly
}) => {
  const editorRef = useRef<CodeMirrorEditor>()

  useEffect(() => {
    if (editorRef.current) {
      highlight?.lines.forEach((line) => {
        editorRef.current?.addLineClass(line, 'background', highlight.className)
      })
      return () => {
        highlight?.lines.forEach((line) => {
          editorRef.current?.removeLineClass(
            line,
            'background',
            highlight.className
          )
        })
      }
    }
    return () => {}
  }, [JSON.stringify(highlight)])

  const classNames = classnames(_classes.root, classes?.root)

  return (
    <Codemirror
      className={classNames}
      editorDidMount={(editor) => {
        handles?.root?.(editor)
        editorRef.current = editor
        editor.setSize('100%', '100%')
        // Hacky, but needed to get editor
        // to size properly after mount
        setTimeout(() => {
          editor.refresh()
        }, 0)
      }}
      options={{
        theme,
        mode,
        lineNumbers,
        tabSize,
        readOnly
      }}
      value={value}
      onBeforeChange={(_, __, val) => onChange(val)}
    />
  )
}
