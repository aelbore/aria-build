import { esBuildPlugin, commonjs, terser } from '../libs'
import { CreateRollupConfigOptions, DEFAULT_VALUES, PluginOptions } from '../common/common'
import { swcPlugin } from '../plugins/rollup-plugin-swc'
import { resolvePathPlugin } from '../plugins/rollup-plugin-resolve-path'

type TSRollupConfig = import('../common/common').TSRollupConfig
type RollupConfigBase = import('../common/common').RollupConfigBase
type PluginBeforeAfter = import('../common/common').PluginBeforeAfter

function buildPlugins({ swc, esbuild }) {
  return [
    ...((esbuild || swc ) ? [ resolvePathPlugin() ]: []),
    ...(esbuild 
          ? [ esBuildPlugin({ 
                transformOptions: {  
                  jsxFactory: 'React.createElement',
                  jsxFragment: 'React.Fragment'
                } 
              }) ]
          : []),
    ...(swc ? [ swcPlugin() ]: [])
  ]
}

function flatPlugins(plugins: PluginOptions) { 
  return [
    ...(plugins?.hasOwnProperty('before') ? (plugins as PluginBeforeAfter).before: []),
    ...(Array.isArray(plugins) ? plugins: []),
    ...(plugins?.hasOwnProperty('after') ? (plugins as PluginBeforeAfter).after: []),
  ]
}

export function createConfig(options: CreateRollupConfigOptions) {
  const { esbuild, swc } = options
  const config = options.config as RollupConfigBase

  const { input, output, commonOpts, compress } = config 

  const mutiplyEntryPlugin = () => 
     Array.isArray(input) ? [ require('@rollup/plugin-multi-entry')() ]: []

  const outputs: any[] = Array.isArray(output) ? output: [ output ]

  const plugins = [
    ...mutiplyEntryPlugin(),
    ...flatPlugins(config.plugins),
    ...buildPlugins({ swc, esbuild }),
    commonjs(commonOpts),
    ...(compress ? [ terser() ]: [])
  ]

  const external = [
    ...(config.external ?? []),
    ...DEFAULT_VALUES.ROLLUP_EXTERNALS
  ]

  const opts: TSRollupConfig = {
    input,
    plugins,
    external,
    output: outputs
  }

  return opts
}