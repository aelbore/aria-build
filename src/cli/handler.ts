import { getPackage, findTargetBuild, copyPackageFile, copyReadMeFile, renameDtsEntryFile, moveDtsFiles } from '../utils/utils'
import { clean } from '../fs/fs'
import { _build } from '../build/index'

import { BuildOptions } from './common'
import { getAriaConfig } from './get-aria-config'
import { parseConfig, getPkgDependencies, mergeGlobals, parsePlugins } from './utils'
import { buildES } from './build-es'
import { buildCommonJS } from './build-cjs'
import { buildUmd } from './build-umd'

export async function handler(options?: BuildOptions) { 
  const { entry, output, config, format } = options

  const [ ariaConfig, pkgJson ] = await Promise.all([
    getAriaConfig(parseConfig({ config, entry })),
    getPackage()
  ])

  const pkgName = pkgJson.name
  const dependencies = getPkgDependencies(pkgJson)
 
  const globals = mergeGlobals(ariaConfig?.output?.globals, options.globals)
  const plugins = parsePlugins(ariaConfig?.plugins)

  options.clean 
    && await clean(options.clean)
  
  const formats = format.split(',')
  const args = { pkgName, dependencies, ...options, plugins, globals }
  const configOptions = await Promise.all(formats.map(format => {
    switch(format) {
      case 'es': return buildES(args)
      case 'cjs': return buildCommonJS(args)
      case 'umd': return buildUmd(args)
    }
  }))

  options.target
    ? await findTargetBuild(options.target, configOptions)
    : await _build({ config: configOptions, name: pkgName }) 

  await Promise.all([ 
    copyPackageFile({ ...pkgJson, output, format, entry }), 
    copyReadMeFile({ output }), 
    renameDtsEntryFile({ config: configOptions, entry, name: pkgName }) 
  ])
  await moveDtsFiles({ name: pkgName, output, entry })  
}