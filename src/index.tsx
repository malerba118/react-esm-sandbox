import React, { useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import styles from './styles.module.css'
import { Messenger } from './utils/messenger'

type SourceFiles = Record<string, SourceFile>

type SourceFile = {
  contents: string
}

enum InterpreterEventType {
  FilesUpdated = 'FilesUpdated',
  Unmounted = 'Unmounted'
}

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

interface Props {
  files: SourceFiles
}

const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

const messenger = Messenger()

export const Interpreter = ({ files = {} }: Props) => {
  const interpreterId = useConstant(uuid())

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
  return <div className={styles.test}>Example Component</div>
}
