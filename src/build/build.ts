import { rollup } from '../libs'
import { createTSRollupConfig, TSRollupConfig, CreateRollupConfigOptions, RollupConfigBase, _createTSRollupConfig, createTSRollupConfigs, createRollupConfigs } from '../config/config'

function getConfigs(config: TSRollupConfig | RollupConfigBase | TSRollupConfig[] | RollupConfigBase[]) {
  return Array.isArray(config) ? config: [ config ]
}

export async function rollupBuild({ inputOptions, outputOptions }) {
  return rollup(inputOptions).then(bundle => bundle.write(outputOptions))
}

export async function build(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = getConfigs(options)
  return Promise.all(configs.map(config => {
    const { inputOptions, outputOptions } = createTSRollupConfig(config)
    return rollupBuild({ inputOptions, outputOptions })
  }))
}

export async function _build(options: CreateRollupConfigOptions) {
  const configs = getConfigs(options.config)
  return Promise.all(configs.map(config => {
    const { inputOptions, outputOptions } = _createTSRollupConfig({ config, name: options.name })
    return rollupBuild({ inputOptions, outputOptions })
  }))
}

export async function ebuild(options: CreateRollupConfigOptions) {
  const { config, name, esbuild } = options
  const opts = getConfigs(config)
  return Promise.all(opts.map(opt => {
    const args = { config: opt, name, esbuild }
    const configs = esbuild ? createRollupConfigs(args): createTSRollupConfigs(args)
    return Promise.all(configs.map(config => {
      const { inputOptions, outputOptions } = config
      return rollupBuild({ inputOptions, outputOptions })
    }))
  }))
}