import { getPackage, findTargetBuild } from '../utils/utils'
import { clean } from '../fs/fs'

import { BuildFormatOptions, BuildOptions } from './common'
import { getAriaConfig } from './get-aria-config'
import { parseConfig, getPkgDependencies, mergeGlobals, parsePlugins, mergeExternal } from './utils'
import { buildConfig } from './build-config'
import { bundle, CreateRollupConfigBuilderOptions } from '../esbuild/esbuild'

export function bundlerOptions(options: Pick<BuildOptions, 'swc' | 'esbuild'> = {}) {  
  let swc: boolean, esbuild: boolean

  esbuild = (!options.swc && typeof options.esbuild == 'boolean') 
    ? options.esbuild
    : (!options.swc) 
        ? true: (options.esbuild ?? false) 

  swc = !esbuild

  return { swc, esbuild }
}

export async function handler(options: BuildOptions) { 
  options.dtsOnly = options['dts-only'] || options.dtsOnly

  const { entry, output, config, format, declaration, dtsOnly, write } = options
  const { esbuild, swc } = bundlerOptions(options)

  const [ ariaConfig, pkgJson ] = await Promise.all([
    getAriaConfig(parseConfig({ config, entry })),
    getPackage(),
    options.clean && clean(options.clean)
  ])

  const pkgName = pkgJson.name
  const dependencies = getPkgDependencies(pkgJson)

  const globals = mergeGlobals(ariaConfig?.output?.globals, options.globals)
  const plugins = parsePlugins(ariaConfig?.plugins)
  const external = mergeExternal(options.external, ariaConfig?.external)

  const args: BuildFormatOptions = { 
    pkgName, 
    dependencies, 
    ...options, 
    plugins, 
    globals, 
    external, 
    ...((!declaration && dtsOnly) ? { declaration: true }: {} ) 
  }
  const configOptions = buildConfig(args)
  
  const buildArgs: CreateRollupConfigBuilderOptions = { 
    config: configOptions, 
    name: pkgName, 
    esbuild, 
    swc, 
    write, 
    dtsOnly
  }

  options.target
    ? await findTargetBuild(options.target, [ configOptions ])
    : await bundle({ ...buildArgs, pkg: { ...pkgJson, output, format, entry, ...(dtsOnly ? { main: '' }: {} ) } })
}