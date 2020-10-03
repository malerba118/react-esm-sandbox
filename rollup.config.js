import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss';

const createOutputConfig = (path) => [
  {
    file: path,
    format: 'es',
    exports: 'named',
    sourcemap: true
  }
]

const plugins = [
  external(),
  postcss({
    extract: false,
    modules: false,
    use: ['sass'],
  }),
  typescript({
    rollupCommonJSResolveHack: true,
    clean: true
  })
]

export default [{
  input: 'src/index.ts',
  output: createOutputConfig('dist/index.js'),
  plugins
},{
  input: 'src/interpreter/index.ts',
  output: createOutputConfig('dist/interpreter/index.js'),
  plugins
},{
  input: 'src/transforms/index.ts',
  output: createOutputConfig('dist/transforms/index.js'),
  plugins
}]
