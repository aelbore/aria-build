import { DEFAULT_VALUES, getPkgDependencies, BuildFormatOptions, handler, clean, PluginOptions, copy } from '../src'
import { replace } from './plugins'

(async function() {
  const pkg = require('../package.json')

  const external = [ 
    ...getPkgDependencies({ ...pkg }), 
    ...DEFAULT_VALUES.ROLLUP_EXTERNALS 
  ]

  const plugins: PluginOptions = [
    copy({
      targets: [
        { src: 'bin/*', dest: 'dist/swc/bin', replace },
        { src: 'bin/*', dest: 'dist/esbuild/bin', replace }
      ]
    })
  ]

  const options: BuildFormatOptions = {
    format: 'es,cjs',
    dependencies: external,
    output: 'dist',
    pkgName: 'aria-build',
    declaration: true,
    plugins,
    write: true
  }

  await clean('dist')
  await Promise.all([
    handler({ 
      ...options, 
      output: './dist/swc', 
      swc: true,
      clean: './dist/swc' 
    }),
    handler({ 
      ...options, 
      output: './dist/esbuild', 
      esbuild: true, 
      clean: './dist/esbuild' 
    })
  ])
})()