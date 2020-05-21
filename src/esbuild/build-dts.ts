import { dirname, join } from 'path'

import { rollup } from '../libs'
import { getPackageName } from '../utils/get-package'
import { DEFAULT_VALUES } from '../common/common'

type TSRollupConfig = import('../common/common').TSRollupConfig
type OutputOptions = import('../common/common').OutputOptions
type CreateRollupConfigOptions = import('../common/common').CreateRollupConfigOptions

async function getName(hasConfig: boolean, name: string) {
  return hasConfig ? name ?? await getPackageName(): undefined
}

async function getDtsLib(hasConfig: boolean) {
  return hasConfig ? await import('rollup-plugin-dts'): undefined
}

export async function esbuildDts(options: CreateRollupConfigOptions) {  
  const { config, write } = options

  const opts = Array.isArray(config) ? config: [ config ]
  const configs = opts.filter((opt: TSRollupConfig) => 
    opt.tsconfig?.compilerOptions?.declaration)

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