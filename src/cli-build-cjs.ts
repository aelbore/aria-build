import { basename } from 'path'
import { BuildFormatOptions, DEFAULT_OUT_DIR } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'

export function buildCommonJS({ pkgName, 
  dependencies, 
  format, 
  entry,
  plugins, 
  declaration, 
  external, 
  sourcemap 
}: BuildFormatOptions): TSRollupConfig {
  const input = entry ?? getInputFile(pkgName)
  const file = entry
    ?  `./${DEFAULT_OUT_DIR}/${basename(entry, '.ts')}.js`
    :  `./${DEFAULT_OUT_DIR}/${pkgName}.js`

  const tsconfig = {
    compilerOptions: { declaration }
  }

  const isSingleFormat = (format.split(',').length === 1);

  const configOptions: TSRollupConfig = {
    input,
    ...(isSingleFormat ? { plugins }: {}),
    external: getExternalDeps({ external, dependencies }),
    output: { 
      file, 
      format: 'cjs',
      sourcemap
    },
    ...(isSingleFormat ? { tsconfig }: {})
  }

  return configOptions
}