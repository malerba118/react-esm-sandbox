export type ImportMap = {
  imports: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}

export type Dependencies = Record<string, string>

export type SourceFile = {
  path: string
  contents: string
}

export type TranspiledFile = {
  path: string
  contents: string
}

export type Transform = (code: string) => string

export type LogType =
  | 'log'
  | 'warn'
  | 'error'
  | 'info'
  | 'debug'
  | 'command'
  | 'result'

export type Log = {
  type: LogType
  data: any[]
}
