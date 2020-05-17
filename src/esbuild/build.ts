import { rollup, esBuildPlugin, commonjs } from '../libs'
import { CreateRollupConfigOptions, TSRollupConfig } from '../config/config'
import { DEFAULT_VALUES, PluginBeforeAfter } from '../common/common'

export async function esbuild(options: CreateRollupConfigOptions) {
  const { config, esbuild } = options
  const opts = Array.isArray(config) ? config: [ config ]

  return Promise.all(opts.map(async opt => {
    const { input, output, commonOpts } = opt as TSRollupConfig

    const mutiplyEntryPlugin = () => 
       Array.isArray(input) ? [ require('@rollup/plugin-multi-entry')() ]: []

    const esBuildPluginEntry = () => esbuild ? [ esBuildPlugin() ]: []

    const plugins = [
      ...(opt.plugins?.hasOwnProperty('before') 
            ? (opt.plugins as PluginBeforeAfter).before: []),
      ...(Array.isArray(opt.plugins) ? opt.plugins: []),
      ...(opt.plugins?.hasOwnProperty('after') 
            ? (opt.plugins as PluginBeforeAfter).after: []),
      ...esBuildPluginEntry(),
      ...mutiplyEntryPlugin(),
      commonjs(commonOpts)
    ]

    const external = [
      ...(opt.external ?? []),
      ...DEFAULT_VALUES.ROLLUP_EXTERNALS
    ]

    const outputs: any[] = Array.isArray(output) ? output: [ output ]

    const bundle = await rollup({ input, plugins, external })
    return Promise.all(outputs.map(bundle.write))
  }))
}