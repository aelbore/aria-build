import { bundle, clean } from '../src'

(async function() {
  const pkg = require('../package.json')

  const external = [
    ...Object.keys(pkg.dependencies)
  ]
  
  const options = [
    {
      input: './src/index.ts',
      external,
      output: {
        file: './dist/aria-build.es.js',
        format: 'es'
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
        file: './dist/aria-build.js',
        format: 'cjs'
      }
    }
  ]
  
  await clean('dist')
  await bundle(options)
})()

