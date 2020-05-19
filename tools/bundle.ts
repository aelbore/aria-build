import { clean, DEFAULT_VALUES, buildConfig, getPkgDependencies, BuildFormatOptions } from '../src'
import { plugins } from './plugins'
import { esbundle } from '../src/esbuild/esbuild'

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
    declaration: true,
    plugins
  }
  
  const config = buildConfig(options)

  await clean('dist')
  await esbundle({ config, name: 'aria-build', swc: true })
})()