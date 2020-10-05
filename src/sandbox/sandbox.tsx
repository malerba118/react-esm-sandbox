import React, { useState, forwardRef, ComponentType, FC } from 'react'
import { Interpreter, InterpreterProps } from '../interpreter'
import { Spinner } from './spinner'
import './sandbox.scss'

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

export interface SandboxProps extends InterpreterProps {
  components?: {
    loading?: LoadingComponent
    error?: ErrorComponent
  }
}

const DefaultLoadingComponent: FC<{}> = () => {
  return (
    <div className='default-loading'>
      <Spinner />
    </div>
  )
}

const CloseIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='18'
      height='18'
      viewBox='0 0 18 18'
    >
      <path d='M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z' />
    </svg>
  )
}

const DefaultErrorComponent: FC<ErrorComponentProps> = ({ error, onClose }) => {
  return (
    <div className='default-error'>
      <button className='close-button' onClick={onClose}>
        <CloseIcon />
      </button>
      <pre>{error.message}</pre>
    </div>
  )
}

const defaultComponents = {
  loading: DefaultLoadingComponent,
  error: DefaultErrorComponent
}

export const Sandbox = forwardRef(
  (
    { onLoading, onLoad, onError, components, ...otherProps }: SandboxProps,
    ref
  ) => {
    const [status, setStatus] = useState(Status.Loading)
    const [error, setError] = useState<Error | null>(null)

    const { loading: LoadingComponent, error: ErrorComponent } = {
      ...defaultComponents,
      ...components
    }

    const handleLoading = () => {
      setStatus(Status.Loading)
    }

    const handleLoad = () => {
      setStatus(Status.Loaded)
    }

    const handleError = (error: Error) => {
      setStatus(Status.Errored)
      setError(error)
    }

    return (
      <div className='esm-sandbox-sandbox'>
        <Interpreter
          ref={ref}
          {...otherProps}
          onLoading={handleLoading}
          onLoad={handleLoad}
          onError={handleError}
        />
        {status === Status.Loading && (
          <div className='overlay'>
            <LoadingComponent />
          </div>
        )}
        {status === Status.Errored && error && (
          <div className='overlay'>
            <ErrorComponent
              error={error}
              onClose={() => {
                setError(null)
              }}
            />
          </div>
        )}
      </div>
    )
  }
)
