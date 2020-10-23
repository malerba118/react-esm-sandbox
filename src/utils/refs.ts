import { MutableRefObject } from 'react'

type RefCallback<T> = (val: T) => void

export const assignRef = <T>(
  ref: MutableRefObject<T> | RefCallback<T> | null,
  val: T
) => {
  if (typeof ref === 'function') {
    ref(val)
  } else if (!!ref) {
    ref.current = val
  }
}
