import React, { useState, forwardRef, ComponentType, FC } from 'react'
import { Interpreter, InterpreterProps, Log } from '../interpreter'
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
}

type LoadingComponent = ComponentType<{}>
type ErrorComponent = ComponentType<ErrorComponentProps>
type ConsoleComponent = ComponentType<ConsoleProps>

export interface SandboxProps extends InterpreterProps {
  components?: {
    loading?: LoadingComponent | null
    error?: ErrorComponent | null
    console?: ConsoleComponent | null
  }
  variant?: 'light' | 'dark'
}

const DefaultLoadingComponent: FC<{}> = () => {
  return (
    <div className={classes.loadingContainer}>
      <Spinner />
    </div>
  )
}

const DefaultErrorComponent: FC<ErrorComponentProps> = ({ error, onClose }) => {
  return (
    <div className={classes.errorContainer}>
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

export const Sandbox = forwardRef(
  (
    {
      onLoading,
      onLoad,
      onError,
      components,
      variant = 'dark',
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
        />
        {status === Status.Loading && LoadingComponent && (
          <div className={classes.overlay}>
            <LoadingComponent />
          </div>
        )}
        {status === Status.Errored && ErrorComponent && error && (
          <div className={classes.overlay}>
            <ErrorComponent
              error={error}
              onClose={() => {
                setError(null)
              }}
            />
          </div>
        )}
        {ConsoleComponent && (
          <ConsoleComponent
            open={consoleOpen}
            onToggle={setConsoleOpen}
            onClear={clearConsole}
            logs={logs}
            variant={variant}
          />
        )}
      </div>
    )
  }
)
