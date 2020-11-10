import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  CSSProperties
} from 'react'
import classnames from 'classnames'
import { Sandbox, SandboxProps } from '../sandbox'
import { EditorGroup, EditorGroupProps } from './editor-group'
import debounce from 'lodash.debounce'
import _classes from './playground.module.css'

export interface PlaygroundProps
  extends Omit<SandboxProps, 'components' | 'styles' | 'classes' | 'handles'>,
    Omit<EditorGroupProps, 'components' | 'styles' | 'handles' | 'classes'> {
  layout?: PlaygroundLayout
  components?: {
    sandbox?: SandboxProps['components']
    editorGroup?: EditorGroupProps['components']
  }
  handles?: {
    sandbox?: SandboxProps['handles']
    editorGroup?: EditorGroupProps['handles']
  }
  classes?: {
    root?: string
    sandbox?: SandboxProps['classes']
    editorGroup?: EditorGroupProps['classes']
  }
  styles?: {
    root?: CSSProperties
    sandbox?: SandboxProps['styles']
    editorGroup?: EditorGroupProps['styles']
  }
}

export enum PlaygroundLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
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
  classes,
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
    _classes.root,
    layout === PlaygroundLayout.Vertical
      ? _classes.vertical
      : _classes.horizontal,
    classes?.root
  )

  return (
    <div className={rootClasses} style={styles?.root}>
      <div className={_classes.editorGroupContainer}>
        <EditorGroup
          files={files}
          active={active}
          onFileChange={onFileChange}
          onActiveChange={onActiveChange}
          editorOptions={editorOptions}
          theme={theme}
          focusOnActivation={focusOnActivation}
          components={components?.editorGroup}
          handles={handles?.editorGroup}
          classes={classes?.editorGroup}
          styles={styles?.editorGroup}
        />
      </div>
      <div className={_classes.interpreterContainer}>
        <Sandbox
          handles={{
            ...handles,
            interpreter: (handle) => {
              interpreterRef.current = handle
              handles?.sandbox?.interpreter?.(handle)
            }
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
          data={data}
          components={components?.sandbox}
          classes={classes?.sandbox}
          styles={styles?.sandbox}
        />
      </div>
    </div>
  )
}
