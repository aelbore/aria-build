import { TSRollupConfig, createTSRollupConfig } from '../config/config'
import { rollupGenerate } from './generate'

export async function buildOutput(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = Array.isArray(options) ? options: [ options ]
  return Promise.all(configs.map(config => {
    const { inputOptions, outputOptions } = createTSRollupConfig(config)
    return rollupGenerate({ inputOptions, outputOptions })
  }))
}