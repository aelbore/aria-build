import { clean, DEFAULT_VALUES, getPkgDependencies, BuildFormatOptions, handler } from '../src'
import { plugins } from './plugins'

(async function() {
  const pkg = require('../package.json')

  const external = [ 
    ...getPkgDependencies({ ...pkg }), 
    ...DEFAULT_VALUES.ROLLUP_EXTERNALS 
  ]

  const options: BuildFormatOptions = {
    format: 'es,cjs',
    dependencies: external,
    output: 'dist',
    pkgName: 'aria-build',
    declaration: false,
    plugins,
    swc: true,
    write: true
  }

  await handler(options)
})()