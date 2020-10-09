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

export type LogMethod =
  | 'log'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'table'
  | 'assert'

export type Log = {
  method: LogMethod
  data?: any[]
}
