import React from 'react'
import { Interpreter, InterpreterProps, SourceFile } from '../interpreter'
import { Editor } from './editor'

export interface PlaygroundProps extends InterpreterProps {
  selectedFile: string | null
  onChange: (file: SourceFile) => void
}

export const Playground = ({
  document,
  files,
  onChange,
  entrypoint,
  importMap,
  onLoading,
  onLoad,
  onError,
  onLog,
  transforms,
  selectedFile
}: PlaygroundProps) => {
  const selected = files.find((file) => file.path === selectedFile)

  const handleChange = (value: string) => {
    if (selected) {
      onChange({
        ...selected,
        contents: value
      })
    }
  }

  return (
    <>
      <Editor value={selected?.contents ?? ''} onChange={handleChange} />
      <Interpreter
        document={document}
        files={files}
        entrypoint={entrypoint}
        importMap={importMap}
        onLoading={onLoading}
        onLoad={onLoad}
        onError={onError}
        onLog={onLog}
        transforms={transforms}
      />
    </>
  )
}
