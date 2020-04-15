import { getInputEntryFile } from '../utils/utils'
import { TSRollupConfig } from '../config/config'

import { BuildFormatOptions } from './common'
import { getEntryFile } from './get-entry-file'
import { isCompress, updateExternalWithResolve, getExternalDeps } from './utils'

export function buildCommonJS(options?: BuildFormatOptions) {
  const { pkgName, plugins, dependencies, format, entry, declaration, resolve, sourcemap, output } = options
  const outDir = output.replace('./', '');

  const input = entry ?? getEntryFile(pkgName)

  const file = entry
    ? `./${outDir}/${getInputEntryFile(entry)}.js`
    : `./${outDir}/${pkgName}.js`

  const compress = isCompress(options.compress, 'cjs')
  const isSingleFormat = (format.split(',').length === 1)

  const external = updateExternalWithResolve(resolve, 
    getExternalDeps({ external: options.external, dependencies })
  )

  const tsconfig = { 
    compilerOptions: { declaration } 
  }

  const configOptions: TSRollupConfig = {
    input,
    compress,
    ...(isSingleFormat ? { plugins }: {}),
    external,
    output: { 
      file, 
      format: 'cjs',
      sourcemap
    },
    ...(isSingleFormat ? { tsconfig }: {})
  }

  return configOptions
}