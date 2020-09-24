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
