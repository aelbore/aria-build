import { getPackage, findTargetBuild, copyPackageFile, copyReadMeFile, erenameDtsEntryFile, moveDtsFiles } from '../utils/utils'
import { clean } from '../fs/fs'
import { ebuild } from '../build/index'

import { BuildOptions } from './common'
import { getAriaConfig } from './get-aria-config'
import { parseConfig, getPkgDependencies, mergeGlobals, parsePlugins } from './utils'
import { buildConfig } from './build-config'
import { esbuild, esbuildDts, esbundle } from '../esbuild/esbuild'

export async function handler(options?: BuildOptions) { 
  const { entry, output, config, format } = options

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

  const buildArgs = { config: configOptions, name: pkgName, esbuild: options.esbuild }

  options.target
    ? await findTargetBuild(options.target, [ configOptions ])
    : (options.esbuild 
        ? await esbundle({ ...buildArgs, pkg: { ...pkgJson, output, format, entry } })
        : await ebuild(buildArgs)
      )

  if (!options.esbuild) {
    await Promise.all([ 
      erenameDtsEntryFile(buildArgs),
      copyPackageFile({ ...pkgJson, output, format, entry }), 
      copyReadMeFile({ output })
    ])
    await moveDtsFiles({ name: pkgName, output, entry })  
  }
}