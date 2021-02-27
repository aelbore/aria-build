import { dirname, join } from 'path'

import { rollup } from '../libs'
import { getPackageName } from '../utils/get-package'
import { DEFAULT_VALUES, TSRollupConfig, OutputOptions } from '../common/common'
import { CreateRollupConfigBuilderOptions } from './bundle'

export async function esbuildDts(options: CreateRollupConfigBuilderOptions) {  
  const { config, write, dtsOnly } = options

  const getName = async(hasConfig: boolean, name: string) => {
    return hasConfig ? name ?? await getPackageName(): undefined
  }
  
  const getDtsLib = async (hasConfig: boolean) => {
    return hasConfig ? await import('rollup-plugin-dts'): undefined
  }  

  const opts = Array.isArray(config) ? config: [ config ]
  const configs = opts.filter((opt: TSRollupConfig) => opt.tsconfig?.compilerOptions?.declaration)

  const hasConfig = configs.length > 0
  const [ name, dts ] = await Promise.all([
    getName(hasConfig, options.name),
    getDtsLib(hasConfig)
  ])

  return Promise.all(configs.map(async opt => { 
    const { input, external, output } = opt as TSRollupConfig
    const outputs: OutputOptions = Array.isArray(output) ? output[0]: output

    const bundle = await rollup({ 
      input, 
      external: [
        ...(external ?? []),
        ...DEFAULT_VALUES.ROLLUP_EXTERNALS
      ], 
      plugins: [ dts.default() ] 
    })

    const file = join(dirname(outputs.file), `${name}.d.ts`)

    return write ? bundle.write({ file }): bundle.generate({ file })
  }))
}