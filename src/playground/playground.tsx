import React from 'react'
import { Interpreter, InterpreterProps, SourceFile } from '../interpreter'
import { Editor } from './editor'

const styles = {
  tabs: {
    display: 'flex'
  },
  tab: {
    border: 'none',
    background: 'none',
    padding: 4,
    display: 'block'
  },
  activeTab: {
    borderBottom: '4px solid #ccc'
  }
}

export interface PlaygroundProps extends InterpreterProps {
  active: string | null
  onFileChange: (file: SourceFile) => void
  onActiveChange: (path: string) => void
}

export const Playground = ({
  document,
  files,
  onFileChange,
  entrypoint,
  importMap,
  onLoading,
  onLoad,
  onError,
  onLog,
  transforms,
  active,
  onActiveChange
}: PlaygroundProps) => {
  const activeFile = files.find((file) => file.path === active)

  const handleChange = (value: string) => {
    if (activeFile) {
      onFileChange({
        ...activeFile,
        contents: value
      })
    }
  }

  return (
    <>
      <div style={styles.tabs}>
        {files.map((file) => (
          <button
            style={{
              ...styles.tab,
              ...(active === file.path ? styles.activeTab : {})
            }}
            onClick={() => onActiveChange(file.path)}
          >
            {file.path}
          </button>
        ))}
      </div>
      <Editor value={activeFile?.contents ?? ''} onChange={handleChange} />
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
