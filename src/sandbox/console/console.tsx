import React, { FC } from 'react'
import classnames from 'classnames'
import { Log } from '../../interpreter'
import { Console as ConsoleFeed } from 'console-feed'
import classes from './console.module.css'

interface ConsoleProps {
  open: boolean
  logs: Log[]
  className?: string
  variant?: 'light' | 'dark'
  onToggle?: (open: boolean) => void
}

export const Console: FC<ConsoleProps> = ({
  open,
  logs,
  className = '',
  variant = 'dark',
  onToggle
}) => {
  const rootClasses = classnames(
    classes.root,
    open ? classes.open : classes.closed,
    variant === 'dark' ? classes.dark : classes.light,
    className
  )
  return (
    <div className={rootClasses}>
      <div className={classes.header}>
        <button onClick={() => onToggle?.(!open)}>Toggle</button>
      </div>
      <div className={classes.content}>
        <ConsoleFeed logs={logs as any} variant={variant} />
      </div>
    </div>
  )
}
