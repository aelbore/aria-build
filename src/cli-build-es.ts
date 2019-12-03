import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'
import { getInputEntryFile } from './utils';

const entryFile = (format?: string, entry?: string) => {
  return (format?.split(',').length === 1) ? `${entry}.js`: `${entry}.es.js`
}

export function buildES(options?: BuildFormatOptions): TSRollupConfig {
    const { pkgName, entry, output, dependencies, declaration, external, plugins, format, sourcemap } = options
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
        format: 'es',
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