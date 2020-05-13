import { TSRollupConfig } from '../config/config'
import { getInputEntryFile } from '../common/common'

import { BuildFormatOptions } from './common'
import { isCompress, entryFile, updateExternalWithResolve, getExternalDeps } from './utils'
import { getEntryFile } from './get-entry-file'

const DEFAULT_FORMAT = 'es'

function getMain(formats: string[], outDir: string, pkgName: string) {
  const outFile = `./${outDir}/${pkgName}`
  return !formats.includes('cjs') 
    ? entryFile(DEFAULT_FORMAT, outFile)
    : entryFile(formats, outFile)
}

export function buildES(options?: BuildFormatOptions) {
    const { pkgName, entry, plugins, output, dependencies, declaration, resolve, format, sourcemap } = options
    const outDir = output.replace('./', '')
    
    const formats = format.split(',')
    const file = entry
      ? entryFile(formats, `./${outDir}/${getInputEntryFile(entry)}`, DEFAULT_FORMAT)
      : getMain(formats, outDir, pkgName)

    const compress = isCompress(options.compress, DEFAULT_FORMAT)
    const input = entry ?? getEntryFile(pkgName)

    const external = updateExternalWithResolve(resolve, 
      getExternalDeps({ external: options.external, dependencies })
    )

    const configOptions: TSRollupConfig = {
      input,
      plugins,
      external,
      output: {
        file,
        format: DEFAULT_FORMAT,
        sourcemap
      },
      tsconfig: {
        compilerOptions: {
          declaration: declaration ?? false
        }
      },
      compress
    }

    return configOptions
}