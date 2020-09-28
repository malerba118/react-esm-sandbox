import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external'

import pkg from './package.json'

export default [{
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true
    })
  ]
},{
  input: 'src/interpreter/index.ts',
  output: [
    {
      file: 'dist/interpreter/index.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true
    })
  ]
}]
