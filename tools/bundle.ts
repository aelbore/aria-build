import { clean, DEFAULT_VALUES, onwarn, copyReadMeFile, mkdir, copyPackageFile, esBuildPlugin } from '../src'
import { plugins } from './plugins'

import { rollup } from 'rollup'
import { builtinModules } from 'module'
import dts from 'rollup-plugin-dts'

(async function() {
  const pkg = require('../package.json')

  const external = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    ...Object.keys(pkg.devDependencies),
    ...builtinModules,
    ...DEFAULT_VALUES.ROLLUP_EXTERNALS
  ]

  const createDtsFile = async () => {
    const opts = {
      input: './src/index.ts',
      external,
      plugins: [ dts() ],
      onwarn,
      output: {
        file: './dist/aria-build.d.ts'
      }
    }

    const bundle = await rollup(opts)
    await bundle.write(opts.output)
  }

  const build = async () => {
    const options: any = {
      input: './src/index.ts',
      external,
      plugins: [ 
        esBuildPlugin(),
        ...plugins
      ],
      onwarn,
      output: [
        {
          file: './dist/aria-build.es.js',
          format: 'es'
        },
        {
          file: './dist/aria-build.js',
          format: 'cjs'
        }
      ]
    }
  
    const bundle = await rollup(options)
    await Promise.all(options.output.map(bundle.write))
  }

  await clean('dist')
  await mkdir('dist')
  await Promise.all([ build(), createDtsFile(), copyReadMeFile(), copyPackageFile() ])
})()