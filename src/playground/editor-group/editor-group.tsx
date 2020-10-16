import React, { useRef, useEffect, useMemo, FC, ComponentType } from 'react'
import classnames from 'classnames'
import { SourceFile } from '../../interpreter'
import { Editor, Highlight } from '../editor'
import { Editor as CodeMirrorEditor } from 'codemirror'
import { getFileExtension } from '../../utils/url'
import { useThemeColors } from '../../utils/hooks'
import classes from './editor-group.module.css'

const getModeByExtension = (extension: string) => {
  const modes = {
    tsx: 'text/typescript',
    ts: 'text/typescript',
    jsx: 'text/jsx',
    js: 'text/javascript',
    json: 'text/json',
    html: 'text/html',
    css: 'text/css',
    scss: 'text/x-scss',
    less: 'text/x-less',
    yaml: 'text/x-yaml',
    yml: 'text/x-yaml'
  }
  return modes[extension] || 'text/typescript'
}

const getEditorBaseOptions = (file: SourceFile) => {
  return {
    mode: getModeByExtension(getFileExtension(file.path)),
    lineNumbers: true
  }
}

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

interface HeaderComponentProps {
  active: string
  files: SourceFile[]
  onActiveChange?: (path: string) => void
  theme?: string
}

type HeaderComponent = ComponentType<HeaderComponentProps>

const DefaultHeaderComponent: FC<HeaderComponentProps> = ({
  files,
  active,
  onActiveChange,
  theme = 'dracula'
}) => {
  const colors = useThemeColors(theme)
  const styles = {
    header: { background: colors.background, color: colors.foreground },
    headerOverlay: { background: colors.overlay }
  }
  return (
    <div className={classes.header} style={styles.header}>
      <div className={classes.headerOverlay} style={styles.headerOverlay}></div>
      <div className={classes.tabs}>
        {files.map((file) => (
          <button
            key={file.path}
            className={classes.tab}
            style={{
              background: active === file.path ? colors.background : 'none'
            }}
            onClick={() => onActiveChange?.(file.path)}
          >
            {file.path}
          </button>
        ))}
      </div>
    </div>
  )
}

interface EditorOptions {
  highlight?: Highlight
  tabSize?: number
  lineNumbers?: boolean
}

type GetEditorOptions = (file: SourceFile) => EditorOptions | undefined

export interface EditorGroupProps {
  active: string
  files: SourceFile[]
  onFileChange?: (file: SourceFile) => void
  onActiveChange?: (path: string) => void
  theme?: string
  editorOptions?: GetEditorOptions
  focusOnActivation?: boolean
  className?: string
  components?: {
    header?: HeaderComponent | null
  }
}

const defaultComponents = {
  header: DefaultHeaderComponent
}

export const EditorGroup: FC<EditorGroupProps> = ({
  files,
  active,
  onActiveChange,
  onFileChange,
  focusOnActivation = true,
  theme,
  editorOptions = () => undefined,
  className,
  components
}) => {
  const editors = useEditors()
  const activeFile = files.find((file) => file.path === active)

  const { header: HeaderComponent } = {
    ...defaultComponents,
    ...components
  }

  useEffect(() => {
    if (focusOnActivation) {
      editors.getEditor(active)?.focus()
    }
    editors.getEditor(active)?.refresh()
  }, [active, focusOnActivation])

  const handleChange = (value: string) => {
    if (activeFile) {
      onFileChange?.({
        ...activeFile,
        contents: value
      })
    }
  }

  const rootClasses = classnames(className, classes.root)

  return (
    <div className={rootClasses}>
      <div className={classes.headerContainer}>
        {HeaderComponent && (
          <HeaderComponent
            active={active}
            onActiveChange={onActiveChange}
            files={files}
            theme={theme}
          />
        )}
      </div>
      <div className={classes.editorContainer}>
        {files.map((file) => {
          const baseEditorOptions = getEditorBaseOptions(file)
          const providedEditorOptions = editorOptions(file)
          const mergedEditorOptions = {
            ...baseEditorOptions,
            ...providedEditorOptions
          }
          return (
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
              {...mergedEditorOptions}
            />
          )
        })}
      </div>
    </div>
  )
}
