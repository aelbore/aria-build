import { TSRollupConfig, clean, bundle } from '../src'
import { plugins } from './plugins'

(async function() {
  const pkg = require('../package.json')

  const external = [
    ...Object.keys(pkg.dependencies)
  ]

  const configOptions: TSRollupConfig[] = [
    {  
      input: './src/index.ts',
      external,
      plugins,
      output: {
        format: 'es',
        file: './dist/aria-build.es.js'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    },
    {
      input: './src/index.ts',
      external,
      output: {
        format: 'cjs',
        file: './dist/aria-build.js'
      }
    }
  ]

  await clean('dist')
  await bundle(configOptions)
})()