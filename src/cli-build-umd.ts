import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps, getUmdGlobals, entryFile } from './cli-utils'
import { getInputEntryFile } from './utils'

export function buildUmd(options?: BuildFormatOptions): TSRollupConfig {
  const { pkgName, dependencies, output, external, globals, plugins, name, sourcemap, entry, format } = options
  const outDir = output.replace('./', '');

  const DEFAULT_FORMAT = 'umd'
  const isSingleFormat = (format.split(',').length === 1);
  
  const input = entry ?? getInputFile(pkgName)
  const file = entry
    ? entryFile(format, `./${outDir}/${getInputEntryFile(entry)}`, DEFAULT_FORMAT)
    : entryFile(format, `./${outDir}/${pkgName}`, DEFAULT_FORMAT)

  const configOptions: TSRollupConfig = {
    input,
    plugins,
    external: getExternalDeps({ external, dependencies }),
    output: { 
      file, 
      format: DEFAULT_FORMAT,
      globals: {
        ...getUmdGlobals(globals)
      },
      name,
      sourcemap
    }
  }

  return configOptions
}