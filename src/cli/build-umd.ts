import { TSRollupConfig } from '../config/config'
import { getInputEntryFile } from '../utils/utils'

import { BuildFormatOptions } from './common'
import { getEntryFile } from './get-entry-file'
import { isCompress, entryFile, updateExternalWithResolve, getExternalDeps } from './utils'

const DEFAULT_FORMAT = 'umd'

function getGlobals(globals: string = '') {
  const results = globals.split(',')
  /// @ts-ignore
  const entries = new Map(results.map(global => global.split('=')))
  return Object.fromEntries(entries)
}

export function buildUmd(options: BuildFormatOptions) {
  const { pkgName, plugins, dependencies, output, resolve, globals, name, sourcemap, entry, format } = options
  const outDir = output.replace('./', '')

  const compress = isCompress(options.compress, DEFAULT_FORMAT)
  
  const formats = format.split(',')
  const input = entry ?? getEntryFile(pkgName)
  const file = entry
    ? entryFile(formats, `./${outDir}/${getInputEntryFile(entry)}`, DEFAULT_FORMAT)
    : entryFile(formats, `./${outDir}/${pkgName}`, DEFAULT_FORMAT)

  const external = updateExternalWithResolve(resolve, 
    getExternalDeps({ external: options.external, dependencies })
  )

  const configOptions: TSRollupConfig = {
    input,
    external,
    plugins,
    output: {
      name,
      file,
      format: DEFAULT_FORMAT,
      sourcemap,
      globals: { 
        ...getGlobals(globals)
      },
    },
    compress
  }

  return configOptions
}