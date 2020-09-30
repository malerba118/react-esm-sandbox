import React, { FC } from 'react'
import { Controlled as Codemirror } from 'react-codemirror2'

interface EditorProps {
  value: string
  onChange: (val: string) => void
}

export const Editor: FC<EditorProps> = ({ value, onChange }) => {
  return (
    <Codemirror
      options={{ theme: 'material' }}
      value={value}
      onBeforeChange={(_, __, val) => onChange(val)}
    />
  )
}
