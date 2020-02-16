import { BuildOptions } from './cli-common'
import { getPackageJsonFile, copyPackageFile, copyReadMeFile, renameDtsEntryFile, moveDtsFiles } from './utils'
import { getAriaConfig, mergeGlobals, parsePlugins, parseConfig } from './cli-utils'
import { clean } from './fs'
import { buildES } from './cli-build-es'
import { buildCommonJS } from './cli-build-cjs'
import { buildUmd } from './cli-build-umd'
import { build } from './build'

export async function handler(options?: BuildOptions) {
  const { entry, output, config, format } = options

  const [ ariaConfig, pkgJson ] = await Promise.all([
    getAriaConfig(parseConfig(config, entry)),
    getPackageJsonFile()
  ])

  const pkgName = pkgJson.name
  const dependencies = pkgJson.dependencies 
      ? Object.keys(pkgJson.dependencies)
      : []

  const globals = mergeGlobals(ariaConfig?.output?.globals, options.globals)
  const plugins = parsePlugins(ariaConfig?.plugins)

  options.clean 
    && await clean(output ?? options.clean)

  const formats = format.split(',')
  const args = { pkgName, dependencies, ...options, plugins, globals }
  const configOptions = await Promise.all(formats.map(format => {
    switch(format) {
      case 'es': return buildES(args)
      case 'cjs': return buildCommonJS(args)
      case 'umd': return buildUmd(args)
    }
  }))

  await build(configOptions)
  await Promise.all([ 
    copyPackageFile({ ...pkgJson, output, format, entry }), 
    copyReadMeFile(options), 
    renameDtsEntryFile(configOptions, entry) 
  ])
  await moveDtsFiles(options)    
}