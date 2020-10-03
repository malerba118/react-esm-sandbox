import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Interpreter, InterpreterProps, SourceFile } from '../interpreter'
import { Editor } from './editor'
import debounce from 'lodash.debounce'
import './playground.scss'

export interface PlaygroundProps extends InterpreterProps {
  active: string | null
  onFileChange: (file: SourceFile) => void
  onActiveChange: (path: string) => void
  theme?: string
  layout?: PlaygroundLayout
}

export enum PlaygroundLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
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
  theme = 'dracula',
  layout = PlaygroundLayout.Horizontal
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

  const requestInterpreterUpdate = useCallback(
    debounce((files) => {
      setInterpreterFiles(files)
    }, 1000),
    []
  )

  useEffect(() => {
    requestInterpreterUpdate(files)
  }, [files])

  const rootClasses = [
    'esm-sandbox-playground',
    'esm-sandbox-playground-' + theme,
    layout === PlaygroundLayout.Vertical ? 'column' : 'row'
  ]

  return (
    <div className={rootClasses.join(' ')}>
      <div className='header'>
        <div className='header-overlay'></div>
        <div className='tabs'>
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
        className={'editor'}
        value={activeFile?.contents ?? ''}
        onChange={handleChange}
        theme={theme}
      />
      <div className='interpreter-container'>
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
    </div>
  )
}
