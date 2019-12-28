import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputEntryFile } from './utils'
import { getExternalDeps, getEntryFile } from './cli-utils'

export function buildCommonJS(options?: BuildFormatOptions): TSRollupConfig {
  const { pkgName, dependencies, format, entry, plugins, declaration, external, sourcemap, output } = options
  const outDir = output.replace('./', '');

  const input = entry ?? getEntryFile(pkgName)
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