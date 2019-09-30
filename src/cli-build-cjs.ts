import { BuildFormatOptions, DEFAULT_OUT_DIR } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'

export function buildCommonJS({ pkgName, dependencies, external, sourcemap }: BuildFormatOptions): TSRollupConfig {
  const input = getInputFile(pkgName)
  const file = `./${DEFAULT_OUT_DIR}/${pkgName}.js`

  const configOptions: TSRollupConfig = {
    input,
    external: getExternalDeps({ external, dependencies }),
    output: { 
      file, 
      format: 'cjs',
      sourcemap
    }
  }

  return configOptions
}