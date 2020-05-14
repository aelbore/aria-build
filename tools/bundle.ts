import { clean, DEFAULT_VALUES, onwarn, terser, copyReadMeFile, mkdir, copyPackageFile, esBuildPlugin, TSRollupConfig, buildConfig } from '../src'
import { plugins } from './plugins'
import { esbundle } from '../src/esbuild/esbuild'

import { builtinModules } from 'module'

(async function() {
  const pkg = require('../package.json')

  const external = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
    ...Object.keys(pkg.devDependencies),
    ...builtinModules,
    ...DEFAULT_VALUES.ROLLUP_EXTERNALS
  ]

  const config = buildConfig({
    format: 'es,cjs',
    dependencies: external,
    output: 'dist',
    pkgName: 'aria-build',
    declaration: true
  })

  await clean('dist')
  await mkdir('dist')
  await esbundle({ config, name: 'aria-build', esbuild: true  })
})()