import React, { useRef, useCallback, useEffect, useState } from 'react'
import classnames from 'classnames'
import { Sandbox, SandboxProps } from '../sandbox'
import { EditorGroup, EditorGroupProps } from './editor-group'
import debounce from 'lodash.debounce'
import classes from './playground.module.css'

export interface PlaygroundProps
  extends Omit<SandboxProps, 'components' | 'styles'>,
    Omit<EditorGroupProps, 'components' | 'styles'> {
  layout?: PlaygroundLayout
  components?: {
    sandbox?: SandboxProps['components']
    editorGroup?: EditorGroupProps['components']
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
  editorOptions = () => undefined
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
        />
      </div>
      <div className={classes.interpreterContainer}>
        <Sandbox
          ref={interpreterRef}
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
        />
      </div>
    </div>
  )
}
