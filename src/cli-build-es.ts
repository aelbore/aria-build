import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getExternalDeps, entryFile, getEntryFile, isCompress } from './cli-utils'
import { getInputEntryFile } from './utils';

export function buildES(options?: BuildFormatOptions): TSRollupConfig {
    const { pkgName, entry, plugins, output, dependencies, declaration, external, format, sourcemap } = options
    const outDir = output.replace('./', '');

    const compress = isCompress(options.compress, 'es')

    const input = entry ?? getEntryFile(pkgName)
    const file = entry
      ? entryFile(format, `./${outDir}/${getInputEntryFile(entry)}`)
      : entryFile(format, `./${outDir}/${pkgName}`)

    const configOptions: TSRollupConfig = {
      input,
      plugins,
      external: getExternalDeps({ external, dependencies }),
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