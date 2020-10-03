import React, { FC } from 'react'
import { Controlled as Codemirror } from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

interface EditorProps {
  value: string
  onChange: (val: string) => void
  theme: string
}

export const Editor: FC<EditorProps> = ({ value, onChange, theme }) => {
  return (
    <Codemirror
      options={{
        theme,
        mode: 'application/javascript'
      }}
      value={value}
      onBeforeChange={(_, __, val) => onChange(val)}
    />
  )
}
