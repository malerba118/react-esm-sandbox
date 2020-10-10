import React, { useEffect, useRef, FC } from 'react'

export const AutoScroll: FC = () => {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    el.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  })

  return <div ref={el}></div>
}
