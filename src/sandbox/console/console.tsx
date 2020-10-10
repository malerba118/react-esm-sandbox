import React, { FC } from 'react'
import classnames from 'classnames'
import { Log } from '../../interpreter'
import { Console as ConsoleFeed } from 'console-feed'
import {
  MdExpandLess as ExpandIcon,
  MdExpandMore as CollapseIcon,
  MdDoNotDisturb as ClearIcon
} from 'react-icons/md'

import classes from './console.module.css'

interface ConsoleProps {
  open: boolean
  logs: Log[]
  className?: string
  variant?: 'light' | 'dark'
  onToggle?: (open: boolean) => void
  onClear?: () => void
}

const styles = {
  BASE_BACKGROUND_COLOR: 'none',
  BASE_FONT_SIZE: '.9rem',
  LOG_ERROR_BACKGROUND: 'rgba(255,0,0,.1)',
  LOG_WARN_BACKGROUND: 'rgba(255,255,0,.1)',
  LOG_INFO_BACKGROUND: 'rgba(0,0,255,.1)'
}

export const Console: FC<ConsoleProps> = ({
  open,
  logs,
  className = '',
  variant = 'dark',
  onToggle,
  onClear
}) => {
  const rootClasses = classnames(
    classes.root,
    open ? classes.open : classes.closed,
    variant === 'dark' ? classes.dark : classes.light,
    className
  )

  const consoleFeedClasses = classnames(classes.content, !open && classes.hide)

  return (
    <>
      <div className={classes.headerPlaceholder}></div>
      <div className={rootClasses}>
        <div className={classes.header}>
          <button
            className={classes.toggleButton}
            onClick={() => onToggle?.(!open)}
            title='Toggle Console'
            aria-label='Toggle Console'
          >
            <span className={classes.label}>Console</span>
            <div className={classes.icons}>
              <button
                className={classes.clearButton}
                onClick={(e) => {
                  onClear?.()
                  e.stopPropagation()
                }}
                title='Clear Console'
                aria-label='Clear Console'
              >
                <ClearIcon />
              </button>
              <span className={classes.toggleIcon}>
                {open ? <CollapseIcon /> : <ExpandIcon />}
              </span>
            </div>
          </button>
        </div>
        <div className={consoleFeedClasses}>
          <ConsoleFeed styles={styles} logs={logs as any} variant={variant} />
        </div>
      </div>
    </>
  )
}
