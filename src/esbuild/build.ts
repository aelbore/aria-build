/* istanbul ignore file */
import { dirname, join } from 'path'

import { rollup, esBuildPlugin, commonjs  } from '../libs'
import { CreateRollupConfigOptions, OutputOptions, TSRollupConfig } from '../config/config'
import { getPackageName } from '../utils/utils'

export async function esbuildDts(options: CreateRollupConfigOptions) {  
  const { config } = options

  const opts = Array.isArray(config) ? config: [ config ]
  const configs = opts.filter((opt: TSRollupConfig) => {
    return opt.tsconfig?.compilerOptions?.declaration
  })

  const name = (configs.length > 0) 
    ? options.name ? options.name: await getPackageName()
    : undefined

  return Promise.all(configs.map(async opt => { 
    const dts = await import('rollup-plugin-dts')
    
    const { input, external, output } = opt as TSRollupConfig
    const outputs: OutputOptions = Array.isArray(output) ? output[0]: output

    const bundle = await rollup({ 
      input, 
      external, 
      plugins: [ dts.default() ] 
    })
    const file = join(dirname(outputs.file), `${name}.d.ts`)

    return bundle.write({ file })
  }))
}

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
      external
    })
    const outputs: any[] = Array.isArray(output) ? output: [ output ]
    
    return Promise.all(outputs.map(bundle.write))
  }))
}