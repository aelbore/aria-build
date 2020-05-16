import { rollup, esBuildPlugin, commonjs } from '../libs'
import { CreateRollupConfigOptions, TSRollupConfig } from '../config/config'
import { DEFAULT_VALUES } from '../common/common'

export async function esbuild(options: CreateRollupConfigOptions) {
  const { config, esbuild } = options
  const opts = Array.isArray(config) ? config: [ config ]

  return Promise.all(opts.map(async opt => {
    const { input, plugins, external, output, commonOpts } = opt as TSRollupConfig

    const mutiplyEntryPlugin = () => 
       Array.isArray(input) ? [ require('@rollup/plugin-multi-entry')() ]: []

    const esBuildPluginEntry = () => esbuild ? [ esBuildPlugin() ]: []

    const bundle = await rollup({
      input, 
      plugins: [
        ...((plugins ?? []) as any[]),
        ...esBuildPluginEntry(),
        ...mutiplyEntryPlugin(),
        commonjs(commonOpts)
      ], 
      external: [
        ...(external ?? []),
        ...DEFAULT_VALUES.ROLLUP_EXTERNALS
      ]
    })
    const outputs: any[] = Array.isArray(output) ? output: [ output ]
    
    return Promise.all(outputs.map(bundle.write))
  }))
}