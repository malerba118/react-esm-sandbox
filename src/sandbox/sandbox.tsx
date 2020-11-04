import React, { useState, ComponentType, FC, CSSProperties } from 'react'
import classnames from 'classnames'
import {
  Interpreter,
  InterpreterProps,
  Log,
  InterpreterHandle
} from '../interpreter'
import { Spinner } from './spinner'
import { Console as DefaultConsoleComponent, ConsoleProps } from './console'
import { MdClose } from 'react-icons/md'
import _classes from './sandbox.module.css'

export enum Status {
  Loading = 'loading',
  Loaded = 'loaded',
  Errored = 'errored'
}

export interface ErrorComponentProps {
  error: Error
  onClose: () => void
  theme: string
  style?: CSSProperties
  className?: string
}

export interface LoadingComponentProps {
  theme: string
  style?: CSSProperties
  className?: string
}

export type LoadingComponent = ComponentType<LoadingComponentProps>
export type ErrorComponent = ComponentType<ErrorComponentProps>
export type ConsoleComponent = ComponentType<ConsoleProps>

export interface SandboxProps extends InterpreterProps {
  components?: {
    loading?: LoadingComponent | null
    error?: ErrorComponent | null
    console?: ConsoleComponent | null
  }
  handles?: {
    root?: (el: HTMLDivElement | null) => void
    interpreter?: (instance: InterpreterHandle | null) => void
  }
  theme?: string
  styles?: {
    interpreter?: CSSProperties
    loading?: CSSProperties
    error?: CSSProperties
    console?: CSSProperties
  }
  classes?: {
    interpreter?: string
    loading?: string
    error?: string
    console?: string
  }
}

const DefaultLoadingComponent: FC<LoadingComponentProps> = ({
  style,
  className
}) => {
  const rootClasses = classnames(_classes.loadingContainer, className)
  return (
    <div className={rootClasses} style={style}>
      <Spinner />
    </div>
  )
}

const DefaultErrorComponent: FC<ErrorComponentProps> = ({
  error,
  onClose,
  className,
  style
}) => {
  const rootClasses = classnames(_classes.errorContainer, className)

  return (
    <div className={rootClasses} style={style}>
      <button className={_classes.closeButton} onClick={onClose}>
        <MdClose />
      </button>
      <pre className={_classes.errorText}>{error.message}</pre>
    </div>
  )
}

const defaultComponents = {
  loading: DefaultLoadingComponent,
  error: DefaultErrorComponent,
  console: DefaultConsoleComponent
}

export const Sandbox: FC<SandboxProps> = ({
  onLoading,
  onLoad,
  onError,
  onLog,
  components,
  theme = 'dracula',
  styles,
  classes,
  handles,
  ...otherProps
}: SandboxProps) => {
  const [status, setStatus] = useState(Status.Loading)
  const [error, setError] = useState<Error | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [consoleOpen, setConsoleOpen] = useState<boolean>(false)

  const pushLog = (log: Log) => {
    setLogs((prev) => [...prev, log])
    onLog?.(log)
  }

  const {
    loading: LoadingComponent,
    error: ErrorComponent,
    console: ConsoleComponent
  } = {
    ...defaultComponents,
    ...components
  }

  const handleLoading = () => {
    setStatus(Status.Loading)
    onLoading?.()
  }

  const handleLoad = () => {
    setStatus(Status.Loaded)
    onLoad?.()
  }

  const handleError = (error: Error) => {
    setStatus(Status.Errored)
    setError(error)
    onError?.(error)
  }

  const clearConsole = () => {
    setLogs([])
  }

  const interpreterClasses = classnames(
    _classes.interpreter,
    classes?.interpreter
  )

  return (
    <div ref={handles?.root} className={_classes.root}>
      <Interpreter
        ref={handles?.interpreter}
        {...otherProps}
        onLog={pushLog}
        onLoading={handleLoading}
        onLoad={handleLoad}
        onError={handleError}
        className={interpreterClasses}
        style={styles?.interpreter}
      />
      {status === Status.Loading && LoadingComponent && (
        <div className={_classes.overlay}>
          <LoadingComponent
            className={classes?.loading}
            theme={theme}
            style={styles?.loading}
          />
        </div>
      )}
      {status === Status.Errored && ErrorComponent && error && (
        <div className={_classes.overlay}>
          <ErrorComponent
            theme={theme}
            style={styles?.error}
            error={error}
            onClose={() => {
              setError(null)
            }}
            className={classes?.error}
          />
        </div>
      )}
      {ConsoleComponent && (
        <ConsoleComponent
          style={styles?.console}
          className={classes?.console}
          open={consoleOpen}
          onToggle={setConsoleOpen}
          onClear={clearConsole}
          logs={logs}
          theme={theme}
        />
      )}
    </div>
  )
}
