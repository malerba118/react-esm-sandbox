import { useRef } from 'react'

export const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}
