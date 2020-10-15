import { useRef, useMemo } from 'react'
import { getThemeColors, isDark } from './colors'

export const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

export const useThemeColors = (theme: string) => {
  return useMemo(() => {
    const colors = getThemeColors(theme)
    return {
      ...colors,
      overlay: isDark(colors.background)
        ? 'rgba(255,255,255,.05)'
        : 'rgba(0,0,0,.05)'
    }
  }, [theme])
}
