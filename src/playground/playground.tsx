import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Interpreter, InterpreterProps, SourceFile } from '../interpreter'
import { Editor } from './editor'
import debounce from 'lodash.debounce'
import './playground.scss'

const styles = {
  tabs: {
    display: 'flex'
  }
}

export interface PlaygroundProps extends InterpreterProps {
  active: string | null
  onFileChange: (file: SourceFile) => void
  onActiveChange: (path: string) => void
  theme: string
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
  onActiveChange,
  theme
}: PlaygroundProps) => {
  const interpreterRef = useRef<any>(null)

  const activeFile = files.find((file) => file.path === active)
  const [interpreterFiles, setInterpreterFiles] = useState(files)

  const handleChange = (value: string) => {
    if (activeFile) {
      onFileChange({
        ...activeFile,
        contents: value
      })
    }
  }

  const requestInterpreterChange = useCallback(
    debounce((files) => {
      setInterpreterFiles(files)
    }, 1000),
    []
  )

  useEffect(() => {
    requestInterpreterChange(files)
  }, [files])

  const rootClasses = [
    'esm-sandbox-playground',
    'esm-sandbox-playground-' + theme
  ]

  return (
    <div className={rootClasses.join(' ')}>
      <div className='header'>
        <div className='header-overlay'></div>
        <div className='tabs' style={styles.tabs}>
          {files.map((file) => (
            <button
              key={file.path}
              className={[
                'tab',
                active === file.path ? 'active-tab' : 'inactive-tab'
              ].join(' ')}
              onClick={() => onActiveChange(file.path)}
            >
              {file.path}
            </button>
          ))}
        </div>
      </div>
      <Editor
        value={activeFile?.contents ?? ''}
        onChange={handleChange}
        theme={theme}
      />
      <Interpreter
        ref={interpreterRef}
        document={document}
        files={interpreterFiles}
        entrypoint={entrypoint}
        importMap={importMap}
        onLoading={onLoading}
        onLoad={onLoad}
        onError={onError}
        onLog={onLog}
        transforms={transforms}
      />
    </div>
  )
}
