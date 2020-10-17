import React, { FC, useState, CSSProperties } from 'react'
import classnames from 'classnames'
import { Log } from '../../interpreter'
import { Console as ConsoleFeed } from 'console-feed'
import {
  MdExpandLess as ExpandIcon,
  MdExpandMore as CollapseIcon,
  MdDoNotDisturb as ClearIcon
} from 'react-icons/md'
import { AutoScroll } from '../auto-scroll'
import classes from './console.module.css'
import { useThemeColors } from '../../utils/hooks'
import { isDark } from '../../utils/colors'

export interface ConsoleProps {
  open: boolean
  logs: Log[]
  className?: string
  onToggle?: (open: boolean) => void
  onClear?: () => void
  theme?: string
  style?: CSSProperties
}

const consoleStyles = {
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
  onToggle,
  onClear,
  theme = 'dracula',
  style
}) => {
  const [stickToBottom, setStickToBottom] = useState(true)

  const rootClasses = classnames(
    classes.root,
    open ? classes.open : classes.closed,
    className
  )

  const consoleFeedClasses = classnames(classes.content, !open && classes.hide)

  const handleScroll = (e: any) => {
    const elem = e.target
    if (elem.scrollTop >= elem.scrollHeight - elem.offsetHeight) {
      !stickToBottom && setStickToBottom(true)
    } else {
      stickToBottom && setStickToBottom(false)
    }
  }

  const colors = useThemeColors(theme)

  const styles = {
    root: { background: colors.background },
    header: { background: colors.background, color: colors.foreground },
    toggle: { background: colors.overlay }
  }

  return (
    <>
      <div className={classes.headerPlaceholder}></div>
      <div className={rootClasses} style={{ ...styles.root, ...style }}>
        <div className={classes.header} style={styles.header}>
          <div
            tabIndex={0}
            role='button'
            className={classes.toggleButton}
            onClick={() => onToggle?.(!open)}
            title='Toggle Console'
            aria-label='Toggle Console'
            style={styles.toggle}
          >
            <span className={classes.label}>Console</span>
            <div className={classes.icons}>
              <button
                className={classes.clearButton}
                onClick={(e) => {
                  onClear?.()
                  setStickToBottom(true)
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
          </div>
        </div>
        <div onScroll={handleScroll} className={consoleFeedClasses}>
          <ConsoleFeed
            styles={consoleStyles}
            logs={logs as any}
            variant={isDark(colors.background) ? 'dark' : 'light'}
          />
          {stickToBottom && <AutoScroll />}
        </div>
      </div>
    </>
  )
}
