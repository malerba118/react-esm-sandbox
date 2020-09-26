import Babel from '@babel/standalone'
import { Transform } from '../../interpreter'

export const TypescriptTransform = () => {
  const transform: Transform = (code: string) => {
    return (
      Babel.transform(code, {
        presets: [
          [
            'env',
            {
              targets: '> 0.25%, not dead',
              // no module transpilation to CJS (!important)
              modules: false
            }
          ],
          'react',
          ['typescript', { allExtensions: true, isTSX: true }]
        ]
      }).code || ''
    )
  }
  return transform
}
