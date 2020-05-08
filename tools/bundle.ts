import { TSRollupConfig, clean, __bundle } from '../src'
import { plugins } from './plugins'

(async function() {
  const pkg = require('../package.json')

  const external = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    ...Object.keys(pkg.devDependencies)
  ]

  const config: TSRollupConfig = {
    input: './src/index.ts',
    external,
    plugins,
    output: [ 
      {
        format: 'es',
        file: './dist/aria-build.es.js'
      },
      {
        format: 'es',
        file: './dist/aria-build.js'  
      }
    ],
    tsconfig: {
      compilerOptions: {
        declaration: true
      }
    }
  }

  await clean('dist')
  await __bundle(config)
})()