export type SourceFiles = Record<string, SourceFile>

export type SourceFile = {
  contents: string
}

export enum InterpreterEventType {
  FilesUpdated = 'FilesUpdated',
  Unmounted = 'Unmounted'
}

export type InterpreterEvent<
  EventType extends InterpreterEventType = InterpreterEventType,
  Payload = any
> = {
  interpreterId: string
  type: EventType
  payload?: Payload
}

export type FilesUpdatedEvent = InterpreterEvent<
  InterpreterEventType.FilesUpdated,
  SourceFiles
>

export type UnmountedEvent = InterpreterEvent<
  InterpreterEventType.Unmounted,
  undefined
>
