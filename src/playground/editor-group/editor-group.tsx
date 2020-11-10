import React, {
  useRef,
  useLayoutEffect,
  useMemo,
  FC,
  ComponentType,
  CSSProperties
} from 'react'
import classnames from 'classnames'
import { SourceFile } from '../../interpreter'
import { Editor, Highlight } from '../editor'
import { Editor as CodeMirrorEditor } from 'codemirror'
import { getFileExtension } from '../../utils/url'
import { useThemeColors } from '../../utils/hooks'
import _classes from './editor-group.module.css'

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

export interface HeaderComponentProps {
  active: string
  files: SourceFile[]
  onActiveChange?: (path: string) => void
  theme?: string
  className?: string
  style?: CSSProperties
}

export type HeaderComponent = ComponentType<HeaderComponentProps>

const DefaultHeaderComponent: FC<HeaderComponentProps> = ({
  files,
  active,
  onActiveChange,
  theme = 'dracula',
  style,
  className
}) => {
  const colors = useThemeColors(theme)
  const _styles = {
    header: {
      background: colors.background,
      color: colors.foreground,
      ...style
    },
    headerOverlay: { background: colors.overlay }
  }
  const rootClasses = classnames(_classes.header, className)
  return (
    <div className={rootClasses} style={_styles.header}>
      <div
        className={_classes.headerOverlay}
        style={_styles.headerOverlay}
      ></div>
      <div className={_classes.tabs}>
        {files.map((file) => (
          <button
            key={file.path}
            className={_classes.tab}
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
  readOnly?: boolean
}

export type GetEditorOptions = (file: SourceFile) => EditorOptions | undefined

export interface EditorGroupProps {
  active: string
  files: SourceFile[]
  onFileChange?: (file: SourceFile) => void
  onActiveChange?: (path: string) => void
  theme?: string
  editorOptions?: GetEditorOptions
  focusOnActivation?: boolean
  classes?: {
    root?: string
    header?: string
    editor?: string
  }
  styles?: {
    root?: CSSProperties
    header?: CSSProperties
  }
  components?: {
    header?: HeaderComponent | null
  }
  handles?: {
    root: (el: HTMLDivElement | null) => void
    editor: (path: string, editor: CodeMirrorEditor | null) => void
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
  handles,
  components,
  classes,
  styles
}) => {
  const editors = useEditors()
  const activeFile = files.find((file) => file.path === active)

  const { header: HeaderComponent } = {
    ...defaultComponents,
    ...components
  }

  useLayoutEffect(() => {
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

  const rootClasses = classnames(classes?.root, _classes.root)

  return (
    <div
      ref={(el) => handles?.root?.(el)}
      className={rootClasses}
      style={styles?.root}
    >
      <div className={_classes.headerContainer}>
        {HeaderComponent && (
          <HeaderComponent
            className={classes?.header}
            style={styles?.header}
            active={active}
            onActiveChange={onActiveChange}
            files={files}
            theme={theme}
          />
        )}
      </div>
      <div className={_classes.editorContainer}>
        {files.map((file) => {
          const baseEditorOptions = getEditorBaseOptions(file)
          const providedEditorOptions = editorOptions(file)
          const mergedEditorOptions = {
            ...baseEditorOptions,
            ...providedEditorOptions
          }
          return (
            <Editor
              handles={{
                root: (editor) => {
                  editors.setEditor(file.path, editor)
                  handles?.editor?.(file.path, editor)
                }
              }}
              key={file.path}
              classes={{
                root: classnames(
                  _classes.editor,
                  activeFile?.path !== file.path && _classes.hide,
                  classes?.editor
                )
              }}
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
