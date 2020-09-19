export type SourceFiles = Record<string, SourceFile>

export type SourceFile = {
  contents: string
}

export enum InterpreterEventType {
  FilesUpdated = 'FilesUpdated',
  Unmounted = 'Unmounted'
}
