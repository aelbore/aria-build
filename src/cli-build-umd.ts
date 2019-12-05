import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps, getUmdGlobals, entryFile } from './cli-utils'
import { mkdirp } from './fs'
import { dirname } from 'path'
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

  mkdirp(dirname(file))

  const configOptions: TSRollupConfig = {
    input,
    ...(isSingleFormat ? { plugins }: {}),
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