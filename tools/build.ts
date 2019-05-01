import { createTSRollupConfig, rollupBuild, copyReadmeFile, copyPackageFile } from '../src'
import { clean } from 'aria-fs'

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

clean('dist')
  .then(() => {
    return Promise.all(options.map(option => {
      return rollupBuild(createTSRollupConfig(option))
    }))
  }).then(() => {
    return Promise.all([ copyReadmeFile(), copyPackageFile() ])
  })