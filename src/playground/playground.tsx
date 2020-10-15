import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect
} from 'react'
import classnames from 'classnames'
import { Sandbox, SandboxProps } from '../sandbox'
import { EditorGroup, EditorGroupProps } from './editor-group'
import { getThemeColors, isDark } from './colors'
import debounce from 'lodash.debounce'
import classes from './playground.module.css'

export interface PlaygroundProps
  extends Omit<SandboxProps, 'components'>,
    Omit<EditorGroupProps, 'components'> {
  layout?: PlaygroundLayout
  components?: SandboxProps['components'] & EditorGroupProps['components']
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

  const { background, foreground } = getThemeColors(theme)

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--esm-sandbox-background-color',
      background
    )
    document.documentElement.style.setProperty(
      '--esm-sandbox-color',
      foreground
    )
    document.documentElement.style.setProperty(
      '--esm-sandbox-overlay-color',
      isDark(background) ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'
    )
    document.documentElement.style.setProperty(
      '--esm-sandbox-focus-color',
      isDark(background) ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'
    )
  }, [background, foreground])

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
          components={components}
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
          variant={isDark(background) ? 'dark' : 'light'}
          components={components}
        />
      </div>
    </div>
  )
}
