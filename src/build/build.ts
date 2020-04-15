import { rollup } from '../libs'
import { createTSRollupConfig, TSRollupConfig } from '../config/config'

export async function rollupBuild({ inputOptions, outputOptions }) {
  return rollup(inputOptions).then(bundle => bundle.write(outputOptions))
}

export async function build(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = Array.isArray(options) ? options: [ options ]
  return Promise.all(configs.map(config => {
    const { inputOptions, outputOptions } = createTSRollupConfig(config)
    return rollupBuild({ inputOptions, outputOptions })
  }))
}