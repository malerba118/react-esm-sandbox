import React, { useRef, useEffect, forwardRef } from 'react'
import { Controlled as Codemirror } from 'react-codemirror2'
import { Editor as CodeMirrorEditor } from 'codemirror'
// import ReactResizeDetector from 'react-resize-detector'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/jsx/jsx.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'

export interface Highlight {
  lines: number[]
  className: string
}

interface EditorProps {
  value: string
  onChange: (val: string) => void
  theme?: string
  className?: string
  highlight?: Highlight
  tabSize?: number
}

export const Editor = forwardRef<CodeMirrorEditor, EditorProps>(
  (
    { value, onChange, theme = 'dracula', className, highlight, tabSize = 2 },
    ref
  ) => {
    const editorRef = useRef<CodeMirrorEditor>()

    useEffect(() => {
      if (editorRef.current) {
        highlight?.lines.forEach((line) => {
          editorRef.current?.addLineClass(
            line,
            'background',
            highlight.className
          )
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

    return (
      <Codemirror
        className={className}
        editorDidMount={(editor) => {
          if (typeof ref === 'function') {
            ref(editor)
          } else if (!!ref) {
            ref.current = editor
          }
          editorRef.current = editor
          editor.setSize('100%', '100%')
        }}
        options={{
          theme,
          mode: {
            name: 'jsx',
            base: { name: 'javascript', typescript: true }
          },
          lineNumbers: true,
          tabSize
        }}
        value={value}
        onBeforeChange={(_, __, val) => onChange(val)}
      />
    )
  }
)
