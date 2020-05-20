import { getPackage, findTargetBuild } from '../utils/utils'
import { clean } from '../fs/fs'

import { BuildOptions } from './common'
import { getAriaConfig } from './get-aria-config'
import { parseConfig, getPkgDependencies, mergeGlobals, parsePlugins } from './utils'
import { buildConfig } from './build-config'
import { esbundle } from '../esbuild/esbuild'

export async function handler(options?: BuildOptions) { 
  const { entry, output, config, format, swc } = options

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

  const buildArgs = { config: configOptions, name: pkgName, esbuild: options.esbuild, swc }

  options.target
    ? await findTargetBuild(options.target, [ configOptions ])
    : await esbundle({ ...buildArgs, pkg: { ...pkgJson, output, format, entry } })
}