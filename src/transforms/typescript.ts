import { transform as transpile } from '@babel/standalone'
import { Transform } from '../interpreter'

export interface TypescriptTransformOptions {
  isTSX?: boolean
  jsxPragma?: string
  allowNamespaces?: boolean
  allowDeclareFields?: boolean
  onlyRemoveTypeImports?: boolean
}

export const TypescriptTransform = ({
  isTSX = true,
  jsxPragma = 'React',
  allowNamespaces = true,
  allowDeclareFields = true,
  onlyRemoveTypeImports = true
}: TypescriptTransformOptions = {}) => {
  const transform: Transform = (code: string) => {
    return (
      transpile(code, {
        presets: [
          [
            'env',
            {
              // no module transpilation to CJS (!important)
              modules: false
            }
          ],
          'react',
          [
            'typescript',
            {
              allExtensions: true,
              isTSX,
              jsxPragma,
              allowNamespaces,
              allowDeclareFields,
              onlyRemoveTypeImports
            }
          ]
        ]
      }).code || ''
    )
  }
  return transform
}
