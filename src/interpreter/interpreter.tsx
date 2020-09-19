import React, { useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { Messenger } from './messenger'
import { InterpreterEventType, SourceFiles } from './types'

const createInterpreterEvent = <
  EventType extends InterpreterEventType,
  Payload
>(options: {
  interpreterId: string
  type: EventType
  payload: Payload
}) => {
  return options
}

const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

const messenger = Messenger()

export interface InterpreterProps {
  files: SourceFiles
}

export const Interpreter = ({ files = {} }: InterpreterProps) => {
  const interpreterId = useConstant(uuid())

  console.log(interpreterId)

  useEffect(() => {
    messenger.then((worker) => {
      const event = createInterpreterEvent({
        interpreterId,
        type: InterpreterEventType.FilesUpdated,
        payload: files
      })
      worker
        .postMessage(event)
        .then((data) => {
          console.log(data)
        })
        .catch(() => {
          console.log('OOPSSSS')
        })
    })
  }, [files])
  return <div>Example Component</div>
}
