import { CreateRollupConfigOptions, onwarn } from '../common/common'
import { rollup } from '../libs'

import { createConfig } from './create-config'

export async function esbuild(options: CreateRollupConfigOptions) {
  const { config, esbuild, swc } = options
  const opts = Array.isArray(config) ? config: [ config ]

  return Promise.all(opts.map(async opt => {
    const config = createConfig({ swc, esbuild, config: opt })
    const { input, external } = config

    const outputs = config.output as any[]
    const plugins = config.plugins as any[]

    const bundle = await rollup({ input, plugins, external, onwarn })
    return Promise.all(outputs.map(bundle.write))
  }))
}