import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputEntryFile } from './utils'
import { getExternalDeps, getEntryFile, isCompress, updateExternalWithResolve } from './cli-utils'

export function buildCommonJS(options?: BuildFormatOptions): TSRollupConfig {
  const { pkgName, plugins, dependencies, format, entry, declaration, resolve, sourcemap, output } = options
  const outDir = output.replace('./', '');

  const input = entry ?? getEntryFile(pkgName)
  const file = entry
    ? `./${outDir}/${getInputEntryFile(entry)}.js`
    : `./${outDir}/${pkgName}.js`

  const compress = isCompress(options.compress, 'cjs')

  const tsconfig = {
    compilerOptions: { declaration }
  }

  const isSingleFormat = (format.split(',').length === 1)

  const external = updateExternalWithResolve(resolve, 
    getExternalDeps({ external: options.external, dependencies })
  )

  const configOptions: TSRollupConfig = {
    input,
    ...(isSingleFormat ? { plugins }: {}),
    external,
    output: { 
      file, 
      format: 'cjs',
      sourcemap
    },
    ...(isSingleFormat ? { tsconfig }: {}),
    compress
  }

  return configOptions
}