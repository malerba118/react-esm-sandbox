import React, { useRef, useEffect, useMemo, FC } from 'react'
import classnames from 'classnames'
import { SourceFile } from '../../interpreter'
import { Editor, Highlight } from '../editor'
import { Editor as CodeMirrorEditor } from 'codemirror'
import classes from './editor-group.module.css'

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

interface EditorOptions {
  highlight?: Highlight
  tabSize?: number
}

type GetEditorOptions = (file: SourceFile) => EditorOptions | undefined

export interface EditorGroupProps {
  active: string
  files: SourceFile[]
  onFileChange: (file: SourceFile) => void
  onActiveChange: (path: string) => void
  theme?: string
  editorOptions?: GetEditorOptions
}

export const EditorGroup: FC<EditorGroupProps> = ({
  files,
  active,
  onActiveChange,
  onFileChange,
  theme,
  editorOptions = () => undefined
}) => {
  const editors = useEditors()
  const activeFile = files.find((file) => file.path === active)

  useEffect(() => {
    editors.getEditor(active)?.focus()
    editors.getEditor(active)?.refresh()
  }, [active])

  const handleChange = (value: string) => {
    if (activeFile) {
      onFileChange({
        ...activeFile,
        contents: value
      })
    }
  }

  return (
    <div className={classes.root}>
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
              editor?.setSize('100%', '100%')
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
    </div>
  )
}
