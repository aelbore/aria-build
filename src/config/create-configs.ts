import { TSRollupConfig, createTSRollupInputOptions } from './ts-rollup-config'
import { CreateRollupConfigOptions, ConfigResult, createOutputOptions } from './base-config'
import { esBuildPlugin } from '../libs'

export function createRollupConfigs(options: CreateRollupConfigOptions) {
  const config = options.config as TSRollupConfig

  const outputs = Array.isArray(config.output) ? config.output: [ config.output ]
  const inputOptions = { ...createTSRollupInputOptions(options) }

  const plugins = inputOptions.plugins as any[]
  const index = plugins.findIndex(plugin => typeof plugin == 'boolean')

  options.esbuild
    && index !== -1 
    && plugins.splice(index, 1, esBuildPlugin())
  
  const result: ConfigResult[] = outputs.map(output => {
    const outputOptions = createOutputOptions({ 
      config: { output },
      name: options.name
    })    
    return { inputOptions, outputOptions }
  })

  return result
}