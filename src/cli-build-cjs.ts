import { basename } from 'path'
import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'

export function buildCommonJS({ pkgName, 
  dependencies, 
  format, 
  entry,
  plugins, 
  declaration, 
  external, 
  sourcemap,
  output
}: BuildFormatOptions): TSRollupConfig {
  const outDir = output.replace('./', '');

  const input = entry ?? getInputFile(pkgName)
  const file = entry
    ?  `./${outDir}/${basename(entry, '.ts')}.js`
    :  `./${outDir}/${pkgName}.js`

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