import { BuildFormatOptions, DEFAULT_OUT_DIR } from './cli-common'
import { TSRollupConfig } from './ts-rollup-config'
import { getInputFile, getExternalDeps } from './cli-utils'

export function buildES({ pkgName, dependencies, declaration, external, plugins, sourcemap }: BuildFormatOptions): TSRollupConfig {
    const input = getInputFile(pkgName)
    const file = `./${DEFAULT_OUT_DIR}/${pkgName}.es.js`

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