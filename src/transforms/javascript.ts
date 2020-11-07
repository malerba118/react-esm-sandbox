import { transform as transpile } from '@babel/standalone'
import { Transform } from '../interpreter'

export interface JavascriptTransformOptions {
  isJSX?: boolean
  targets?: string | Array<string> | Record<string, string>
}

export const JavascriptTransform = ({
  isJSX = true,
  targets = '> 0.25%, not dead'
}: JavascriptTransformOptions = {}) => {
  const presets: any[] = [
    [
      'env',
      {
        // no module transpilation to CJS (!important)
        modules: false,
        targets
      }
    ]
  ]

  if (isJSX) {
    presets.push('react')
  }

  const transform: Transform = (code: string) => {
    return (
      transpile(code, {
        presets
      }).code || ''
    )
  }
  return transform
}
