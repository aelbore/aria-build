import { basename } from 'path'
import { BuildFormatOptions } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'

export function buildES({ pkgName, 
  entry, 
  output, 
  dependencies, 
  declaration, 
  external, 
  plugins, 
  sourcemap 
}: BuildFormatOptions): TSRollupConfig {
    const outDir = output.replace('./', '');

    const input = entry ?? getInputFile(pkgName)
    const file = entry
      ?  `./${outDir}/${basename(entry, '.ts')}.es.js`
      :  `./${outDir}/${pkgName}.es.js`

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