import { clean, DEFAULT_VALUES, buildConfig, getPkgDependencies, BuildFormatOptions } from '../src'
import { plugins } from './plugins'
import { swcBundler } from '../src/builders/swc-bundler'

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
    swc: true
  }

  await clean('dist')
  await swcBundler(options)
})()