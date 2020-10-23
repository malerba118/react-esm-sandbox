import React, {
  useState,
  forwardRef,
  ComponentType,
  FC,
  CSSProperties
} from 'react'
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
import classes from './sandbox.module.css'

enum Status {
  Loading = 'loading',
  Loaded = 'loaded',
  Errored = 'errored'
}

interface ErrorComponentProps {
  error: Error
  onClose: () => void
  theme: string
  style?: CSSProperties
  className?: string
}

interface LoadingComponentProps {
  theme: string
  style?: CSSProperties
  className?: string
}

type LoadingComponent = ComponentType<LoadingComponentProps>
type ErrorComponent = ComponentType<ErrorComponentProps>
type ConsoleComponent = ComponentType<ConsoleProps>

export interface SandboxStyles {
  interpreter?: CSSProperties
  loading?: CSSProperties
  error?: CSSProperties
  console?: CSSProperties
}

export interface SandboxProps extends InterpreterProps {
  components?: {
    loading?: LoadingComponent | null
    error?: ErrorComponent | null
    console?: ConsoleComponent | null
  }
  theme?: string
  styles?: SandboxStyles
}

const DefaultLoadingComponent: FC<LoadingComponentProps> = ({
  style,
  className
}) => {
  const rootClasses = classnames(classes.loadingContainer, className)
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
  const rootClasses = classnames(classes.errorContainer, className)

  return (
    <div className={rootClasses} style={style}>
      <button className={classes.closeButton} onClick={onClose}>
        <MdClose />
      </button>
      <pre className={classes.errorText}>{error.message}</pre>
    </div>
  )
}

const defaultComponents = {
  loading: DefaultLoadingComponent,
  error: DefaultErrorComponent,
  console: DefaultConsoleComponent
}

export type SandboxHandle = InterpreterHandle

export const Sandbox = forwardRef<SandboxHandle, SandboxProps>(
  (
    {
      onLoading,
      onLoad,
      onError,
      components,
      theme = 'dracula',
      styles,
      ...otherProps
    }: SandboxProps,
    ref
  ) => {
    const [status, setStatus] = useState(Status.Loading)
    const [error, setError] = useState<Error | null>(null)
    const [logs, setLogs] = useState<Log[]>([])
    const [consoleOpen, setConsoleOpen] = useState<boolean>(false)

    const pushLog = (log: Log) => {
      setLogs((prev) => [...prev, log])
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

    return (
      <div className={classes.root}>
        <Interpreter
          ref={ref}
          {...otherProps}
          onLog={pushLog}
          onLoading={handleLoading}
          onLoad={handleLoad}
          onError={handleError}
          className={classes.interpreter}
          style={styles?.interpreter}
        />
        {status === Status.Loading && LoadingComponent && (
          <div className={classes.overlay}>
            <LoadingComponent theme={theme} style={styles?.loading} />
          </div>
        )}
        {status === Status.Errored && ErrorComponent && error && (
          <div className={classes.overlay}>
            <ErrorComponent
              theme={theme}
              style={styles?.error}
              error={error}
              onClose={() => {
                setError(null)
              }}
            />
          </div>
        )}
        {ConsoleComponent && (
          <ConsoleComponent
            style={styles?.console}
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
)
