import { useRef, useMemo } from 'react'
import { getThemeColors } from './colors'

export const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

export const useThemeColors = (theme: string) => {
  return useMemo(() => {
    return getThemeColors(theme)
  }, [theme])
}
