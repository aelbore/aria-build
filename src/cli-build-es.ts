import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps, entryFile } from './cli-utils'
import { getInputEntryFile } from './utils';

export function buildES(options?: BuildFormatOptions): TSRollupConfig {
    const { pkgName, entry, output, dependencies, declaration, external, plugins, format, sourcemap, compress } = options
    const outDir = output.replace('./', '');

    const input = entry ?? getInputFile(pkgName)
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
      }
    }

    return configOptions
  }