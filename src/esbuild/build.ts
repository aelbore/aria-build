import { rollup, esBuildPlugin, commonjs } from '../libs'
import { CreateRollupConfigOptions, TSRollupConfig, onwarn } from '../config/config'
import { DEFAULT_VALUES, PluginBeforeAfter, PluginOptions } from '../common/common'
import { swcPlugin } from '../plugins/rollup-plugin-swc'

function buildPlugins({ swc, esbuild }) {
  return [
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

export async function esbuild(options: CreateRollupConfigOptions) {
  const { config, esbuild, swc } = options
  const opts = Array.isArray(config) ? config: [ config ]

  return Promise.all(opts.map(async opt => {
    const { input, output, commonOpts } = opt as TSRollupConfig

    const mutiplyEntryPlugin = () => 
       Array.isArray(input) ? [ require('@rollup/plugin-multi-entry')() ]: []

    const plugins = [
      ...mutiplyEntryPlugin(),
      ...flatPlugins(opt.plugins),
      ...buildPlugins({ swc, esbuild }),
      commonjs(commonOpts)
    ]

    const external = [
      ...(opt.external ?? []),
      ...DEFAULT_VALUES.ROLLUP_EXTERNALS
    ]

    const outputs: any[] = Array.isArray(output) ? output: [ output ]

    const bundle = await rollup({ input, plugins, external, onwarn })
    return Promise.all(outputs.map(bundle.write))
  }))
}