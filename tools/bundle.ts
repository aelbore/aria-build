import { TSRollupConfig, clean, bundle, copy} from '../src'
import { link } from './link-plugin'
import { replaceContent } from './common'

(async function() {
  const pkg = require('../package.json')

  const external = [
    ...Object.keys(pkg.dependencies)
  ]

  const plugins = [
    copy({
      targets: [
        { src: 'bin/*', dest: 'dist/bin', replace: replaceContent }
      ]
    }),
    link({
      targets: [
        { package: 'aria-fs' },
        { package: 'aria-mocha' },
        { package: 'lit-element-transpiler' }
      ]
    })
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