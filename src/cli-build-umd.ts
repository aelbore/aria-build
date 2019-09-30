import { BuildFormatOptions, DEFAULT_OUT_DIR } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps, getUmdGlobals } from './cli-utils'
import { mkdirp } from './fs'
import { dirname } from 'path'

export function buildUmd({ pkgName, dependencies, external, globals, name, sourcemap }: BuildFormatOptions): TSRollupConfig {
  const input = getInputFile(pkgName)
  const file = `./${DEFAULT_OUT_DIR}/bundles/${pkgName}.umd.js`

  mkdirp(dirname(file))

  const configOptions: TSRollupConfig = {
    input,
    external: getExternalDeps({ external, dependencies }),
    output: { 
      file, 
      format: 'umd',
      globals: {
        ...getUmdGlobals(globals)
      },
      name,
      sourcemap
    }
  }

  return configOptions
}