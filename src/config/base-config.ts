import { TSRollupConfig, RollupConfigBase, RollupConfigOutput } from './common'

export interface CreateRollupConfigOptions {
  config: RollupConfigBase | TSRollupConfig | RollupConfigBase[] | TSRollupConfig[]
  name?: string
  esbuild?: boolean
  swc?: boolean
}

export interface OutputOptions extends RollupConfigOutput {  }

export function onwarn(options: { code: string, message: string }) {
  !options.code.includes('THIS_IS_UNDEFINED') 
    && console.log('Rollup warning: ', options.message)
}