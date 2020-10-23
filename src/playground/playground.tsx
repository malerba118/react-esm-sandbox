import React, { useRef, useCallback, useEffect, useState } from 'react'
import classnames from 'classnames'
import { Sandbox, SandboxProps, SandboxHandle } from '../sandbox'
import { EditorGroup, EditorGroupProps } from './editor-group'
import debounce from 'lodash.debounce'
import classes from './playground.module.css'

export interface PlaygroundProps
  extends Omit<SandboxProps, 'components' | 'styles'>,
    Omit<EditorGroupProps, 'components' | 'styles' | 'onEditorHandle'> {
  layout?: PlaygroundLayout
  components?: {
    sandbox?: SandboxProps['components']
    editorGroup?: EditorGroupProps['components']
  }
  handles?: {
    sandbox?: (handle: SandboxHandle | null) => void
    editor?: EditorGroupProps['onEditorHandle']
  }
  styles?: PlaygroundStyles
}

export enum PlaygroundLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export interface PlaygroundStyles {
  sandbox?: SandboxProps['styles']
}

export const Playground = ({
  doc,
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
  layout = PlaygroundLayout.Vertical,
  focusOnActivation,
  components,
  styles,
  data,
  editorOptions = () => undefined,
  handles
}: PlaygroundProps) => {
  const interpreterRef = useRef<any>(null)

  const [interpreterFiles, setInterpreterFiles] = useState(files)

  const requestInterpreterUpdate = useCallback(
    debounce((files) => {
      setInterpreterFiles(files)
    }, 1000),
    []
  )

  useEffect(() => {
    requestInterpreterUpdate(files)
  }, [files])

  const rootClasses = classnames(
    classes.root,
    layout === PlaygroundLayout.Vertical ? classes.vertical : classes.horizontal
  )

  return (
    <div className={rootClasses}>
      <div className={classes.editorGroupContainer}>
        <EditorGroup
          files={files}
          active={active}
          onFileChange={onFileChange}
          onActiveChange={onActiveChange}
          editorOptions={editorOptions}
          theme={theme}
          focusOnActivation={focusOnActivation}
          components={components?.editorGroup}
          onEditorHandle={handles?.editor}
        />
      </div>
      <div className={classes.interpreterContainer}>
        <Sandbox
          ref={(handle) => {
            interpreterRef.current = handle
            handles?.sandbox?.(handle)
          }}
          doc={doc}
          files={interpreterFiles}
          entrypoint={entrypoint}
          importMap={importMap}
          onLoading={onLoading}
          onLoad={onLoad}
          onError={onError}
          onLog={onLog}
          transforms={transforms}
          theme={theme}
          components={components?.sandbox}
          styles={styles?.sandbox}
          data={data}
        />
      </div>
    </div>
  )
}
