import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getExternalDeps, getUmdGlobals, entryFile, getEntryFile, isCompress } from './cli-utils'
import { getInputEntryFile } from './utils'

export function buildUmd(options?: BuildFormatOptions): TSRollupConfig {
  const { pkgName, plugins, dependencies, output, external, globals, name, sourcemap, entry, format } = options
  const outDir = output.replace('./', '');

  const DEFAULT_FORMAT = 'umd'
  const compress = isCompress(options.compress, DEFAULT_FORMAT)
  
  const input = entry ?? getEntryFile(pkgName)
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
    },
    compress
  }

  return configOptions
}