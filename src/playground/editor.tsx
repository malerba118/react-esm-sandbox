import React, { FC } from 'react'
import { Controlled as Codemirror } from 'react-codemirror2'
// import ReactResizeDetector from 'react-resize-detector'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/jsx/jsx.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'

interface EditorProps {
  value: string
  onChange: (val: string) => void
  theme?: string
  className?: string
}

export const Editor: FC<EditorProps> = ({
  value,
  onChange,
  theme = 'dracula',
  className
}) => {
  // const editorRef = useRef<any>(null)

  return (
    <Codemirror
      className={className}
      editorDidMount={(editor) => {
        editor.setSize('100%', '100%')
        editor.focus()
      }}
      options={{
        theme,
        mode: {
          name: 'jsx',
          base: { name: 'javascript', typescript: true }
        }
      }}
      value={value}
      onBeforeChange={(_, __, val) => onChange(val)}
    />
  )
}
