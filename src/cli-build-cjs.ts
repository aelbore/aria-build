import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'
import { getInputEntryFile } from './utils'

export function buildCommonJS(options?: BuildFormatOptions): TSRollupConfig {
  const { pkgName, dependencies, format, entry, plugins, declaration, external, sourcemap, output } = options
  const outDir = output?.replace('./', '');

  const input = entry ?? getInputFile(pkgName)
  const file = entry
    ? `./${outDir}/${getInputEntryFile(entry)}.js`
    : `./${outDir}/${pkgName}.js`

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