import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getExternalDeps, entryFile, getEntryFile, isCompress, updateExternalWithResolve } from './cli-utils'
import { getInputEntryFile } from './utils';

export function buildES(options?: BuildFormatOptions): TSRollupConfig {
    const { pkgName, entry, plugins, output, dependencies, declaration, resolve, format, sourcemap } = options
    const outDir = output.replace('./', '');

    const compress = isCompress(options.compress, 'es')

    const getMain = (format: string, outDir: string, pkgName: string) => {
      const outFile = `./${outDir}/${pkgName}`
      return (!format?.split(',').includes('cjs') 
          ? entryFile('es', outFile): entryFile(format, outFile)
        )
    }

    const input = entry ?? getEntryFile(pkgName)
    const file = entry
      ? entryFile(format, `./${outDir}/${getInputEntryFile(entry)}`)
      : getMain(format, outDir, pkgName)

    const external = updateExternalWithResolve(resolve, 
      getExternalDeps({ external: options.external, dependencies })
    )

    const configOptions: TSRollupConfig = {
      input,
      plugins,
      external,
      output: { 
        file, 
        sourcemap
      },
      tsconfig: {
        compilerOptions: {
          declaration
        }
      },
      compress
    }

    return configOptions
  }