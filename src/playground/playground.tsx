import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
  useMemo
} from 'react'
import classnames from 'classnames'
import { SourceFile } from '../interpreter'
import { Sandbox, SandboxProps } from '../sandbox'
import { Editor, Highlight } from './editor'
import { getThemeColors, isDark } from './colors'
import { Editor as CodeMirrorEditor } from 'codemirror'
import debounce from 'lodash.debounce'
import classes from './playground.module.css'

const useEditors = () => {
  const editors = useRef<Record<string, CodeMirrorEditor>>({})

  return useMemo(
    () => ({
      setEditor: (path: string, editor: CodeMirrorEditor | null) => {
        if (!editor) {
          delete editors.current[path]
        } else {
          editors.current[path] = editor
        }
      },
      getEditor: (path: string) => {
        return editors.current[path]
      }
    }),
    []
  )
}

export { Highlight, Editor }

interface EditorOptions {
  highlight?: Highlight
}

type GetEditorOptions = (file: SourceFile) => EditorOptions | undefined

export interface PlaygroundProps extends SandboxProps {
  active: string
  onFileChange: (file: SourceFile) => void
  onActiveChange: (path: string) => void
  theme?: string
  layout?: PlaygroundLayout
  editorOptions?: GetEditorOptions
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
  editorOptions = () => undefined
}: PlaygroundProps) => {
  const interpreterRef = useRef<any>(null)

  const activeFile = files.find((file) => file.path === active)
  const [interpreterFiles, setInterpreterFiles] = useState(files)
  const editors = useEditors()

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

  useEffect(() => {
    editors.getEditor(active)?.focus()
  }, [active])

  const rootClasses = classnames(
    classes.root,
    layout === PlaygroundLayout.Vertical ? classes.column : classes.row
  )

  return (
    <div className={rootClasses}>
      <div className={classes.header}>
        <div className={classes.headerOverlay}></div>
        <div className={classes.tabs}>
          {files.map((file) => (
            <button
              key={file.path}
              className={classnames(
                classes.tab,
                active === file.path ? classes.activeTab : classes.inactiveTab
              )}
              onClick={() => onActiveChange(file.path)}
            >
              {file.path}
            </button>
          ))}
        </div>
      </div>
      <div className={classes.editorContainer}>
        {files.map((file) => (
          <Editor
            ref={(editor) => {
              editors.setEditor(file.path, editor)
            }}
            key={file.path}
            className={classnames(
              classes.editor,
              activeFile?.path !== file.path && classes.hide
            )}
            value={file.contents ?? ''}
            onChange={handleChange}
            theme={theme}
            {...editorOptions(file)}
          />
        ))}
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
        />
      </div>
    </div>
  )
}
