import { BuildOptions } from './cli-common'
import { getPackageJsonFile, copyPackageFile, copyReadMeFile, renameDtsEntryFile, moveDtsFiles } from './utils'
import { getAriaConfig, mergeGlobals, parsePlugins } from './cli-utils'
import { clean } from './fs'
import { buildES } from './cli-build-es'
import { buildCommonJS } from './cli-build-cjs'
import { buildUmd } from './cli-build-umd'
import { build } from './build'

export async function handler(options?: BuildOptions) {
  const { entry, output, config } = options;

  const pkgJson = await getPackageJsonFile(), 
    pkgName = pkgJson.name,
    dependencies = pkgJson.dependencies 
      ? Object.keys(pkgJson.dependencies)
      : []

  const ariaConfig = await getAriaConfig(config)
  options.globals = mergeGlobals(ariaConfig?.output?.globals, options.globals)
  options.plugins = parsePlugins(ariaConfig?.plugins)

  options.clean 
    && await clean(output ?? options.clean)

  const formats = options.format.split(',')
  const configOptions = await Promise.all(formats.map(format => {
    const args = { pkgName, dependencies, ...options }
    switch(format) {
      case 'es': return buildES(args)
      case 'cjs': return buildCommonJS(args)
      case 'umd': return buildUmd(args)
    }
  }))

  await build(configOptions)
  await Promise.all([ 
    copyPackageFile({ ...pkgJson, output, entry }), 
    copyReadMeFile(options), 
    renameDtsEntryFile(configOptions, entry) 
  ])
  await moveDtsFiles(options)    
}
