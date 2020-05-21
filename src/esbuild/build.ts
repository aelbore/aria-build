import { CreateRollupConfigOptions, onwarn } from '../common/common'
import { rollup } from '../libs'
import { createConfig } from './create-config'

function createConfigOptions(options: CreateRollupConfigOptions) {
  const { esbuild, swc } = options
  const config = createConfig({ swc, esbuild, config: options.config })

  const outputs = config.output as any[]
  const plugins = config.plugins as any[]

  return {
    input: config.input,
    external: config.external,
    plugins,
    output: outputs
  }
}

export async function esbuild(options: CreateRollupConfigOptions) {
  const { config, esbuild, swc, write } = options
  const opts = Array.isArray(config) ? config: [ config ]

  return Promise.all(opts.map(async opt => {
    const { input, plugins, external, output } = createConfigOptions({ 
      swc, esbuild, config: opt 
    })
    const bundle = await rollup({ input, plugins, external, onwarn })
    const execute = () => write ? bundle.write: bundle.generate
    return Promise.all(output.map(execute()))
  }))
}