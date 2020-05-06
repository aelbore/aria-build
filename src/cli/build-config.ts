import { join } from 'path'

import { ModuleFormat } from '../libs'
import { TSRollupConfig, RollupConfigOutput } from '../config/config'
import { getInputEntryFile } from '../utils/utils'

import { BuildFormatOptions } from './common'
import { getEntryFile } from './get-entry-file'
import { updateExternalWithResolve, getExternalDeps, entryFile } from './utils'
import { getGlobals } from './build-umd'

function getMain(args: GetFileOptions) {
  const { outDir, name, formats, format } = args
  return !formats.includes('cjs') 
    ? entryFile(format, join(outDir, name))
    : entryFile(formats, join(outDir, name))
}

function createOutputFile(args: GetFileOptions) {
  const { outDir, name, formats, format } = args
  switch (format) {
    case 'cjs': 
      return join(outDir, `${name}.js`)
    case 'es': 
      return getMain({ outDir, name, formats })
    case 'umd': 
      return entryFile(formats, join(outDir, name) , format)
  }
}

export interface GetFileOptions {
  outDir: string
  name: string
  formats: string[]
  format?: ModuleFormat
  entry?: string
}

export function buildConfig(options: BuildFormatOptions) {
  const { pkgName, entry, dependencies, declaration, globals, name, resolve, format } = options
  const outDir = options.output.replace('./', '')
  
  const sourcemap = options.sourcemap ?? false
  const formats = format.split(',')
  const input = entry ?? getEntryFile(pkgName)

  const output = formats.map((format: ModuleFormat) => {
    const file = entry 
      ? entryFile(format.includes('cjs') ? format: formats, 
          join(outDir, getInputEntryFile(entry)), 
          format)
      : createOutputFile({ outDir, format, formats, name: pkgName })

    const output: RollupConfigOutput = {
      sourcemap,
      format,
      file,
      ...(format.includes('umd') 
          ? {
              name,
              globals: { 
                ...getGlobals(globals)
              }
            }
          : {})
    }

    return output
  })

  const plugins = options.plugins ?? []

  const external = updateExternalWithResolve(resolve, 
    getExternalDeps({ external: options.external, dependencies })
  )

  const configOptions: TSRollupConfig = { 
    input,
    external,
    plugins,
    output,
    tsconfig: {
      compilerOptions: {
        declaration: declaration ?? false
      }
    }
  }
  
  return configOptions
}