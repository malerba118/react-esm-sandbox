import { useState, useMemo } from 'react'
import { getThemeColors } from './colors'

export const useConstant = <T>(getter: () => T): T => {
  const [state] = useState(getter)
  return state
}

export const useThemeColors = (theme: string) => {
  return useMemo(() => {
    return getThemeColors(theme)
  }, [theme])
}
