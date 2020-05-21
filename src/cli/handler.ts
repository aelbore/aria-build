import { getPackage, findTargetBuild } from '../utils/utils'
import { clean } from '../fs/fs'

import { BuildOptions } from './common'
import { getAriaConfig } from './get-aria-config'
import { parseConfig, getPkgDependencies, mergeGlobals, parsePlugins } from './utils'
import { buildConfig } from './build-config'
import { bundle } from '../esbuild/esbuild'

export async function handler(options?: BuildOptions) { 
  const { entry, output, config, format, write } = options

  const esbuild = ((!options.swc && options.esbuild) || (options.swc && options.esbuild)) ? true: false 
  const swc = (!esbuild) ? true: false
  
  const [ ariaConfig, pkgJson ] = await Promise.all([
    getAriaConfig(parseConfig({ config, entry })),
    getPackage(),
    options.clean && clean(options.clean)
  ])

  const pkgName = pkgJson.name
  const dependencies = getPkgDependencies(pkgJson)
 
  const globals = mergeGlobals(ariaConfig?.output?.globals, options.globals)
  const plugins = parsePlugins(ariaConfig?.plugins)

  const args = { pkgName, dependencies, ...options, plugins, globals }
  const configOptions = buildConfig(args)

  const buildArgs = { config: configOptions, name: pkgName, esbuild, swc, write }

  options.target
    ? await findTargetBuild(options.target, [ configOptions ])
    : await bundle({ ...buildArgs, pkg: { ...pkgJson, output, format, entry } })
}