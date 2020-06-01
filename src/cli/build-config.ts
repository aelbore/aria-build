import { join } from 'path'

import { ModuleFormat, terser } from '../libs'
import { getInputEntryFile, TSRollupConfig, RollupConfigOutput } from '../common/common'

import { BuildFormatOptions } from './common'
import { getEntryFile } from './get-entry-file'
import { updateExternalWithResolve, getExternalDeps, entryFile } from './utils'

function getMain(args: GetFileOptions) {
  const { outDir, name, formats, format } = args
  return !formats.includes('cjs') 
    ? entryFile(format, join(outDir, name))
    : entryFile(formats, join(outDir, name), format)
}

function createOutputFile(args: GetFileOptions) {
  const { outDir, name, formats, format } = args
  switch (format) {
    case 'cjs': 
      return join(outDir, 'cjs', `${name}.js`)
    case 'es': 
      return getMain({ outDir, name, formats })
    case 'umd': 
      return entryFile(formats, join(outDir, name), format)
  }
}

function getGlobals(globals: string = '') {
  const results = globals.split(',')
  /// @ts-ignore
  const entries = new Map(results.map(global => global.split('=')))
  return Object.fromEntries(entries)
}

export interface GetFileOptions {
  outDir: string
  name: string
  formats: string[]
  format?: ModuleFormat
  entry?: string
}

export function buildConfig(options: BuildFormatOptions) {
  const { pkgName, entry, dependencies, declaration, compress, globals, name, resolve, format } = options
  const outDir = options.output.replace('./', '')
  
  const sourcemap = options.sourcemap ?? false
  const formats = format.split(',')
  const input = entry ?? getEntryFile(pkgName)

  const isCompressFormat = (format: string) => 
    (compress && typeof compress == "string" && compress.split(',').includes(format))

  const output = formats.map((format: ModuleFormat) => {
    const file = entry  
      ? entryFile(format.includes('cjs') ? format: formats, 
          join(outDir, getInputEntryFile(entry)), 
          format)
      : createOutputFile({ outDir, format, formats, name: pkgName })

    const plugins = [ ...(isCompressFormat(format) ? [ terser() ]: []) ] 

    const output: RollupConfigOutput = {
      sourcemap,
      format,
      plugins,
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

  const external = updateExternalWithResolve({ 
    resolve, 
    external: getExternalDeps({ external: options.external, dependencies })
  })

  const configOptions: TSRollupConfig = { 
    input,
    external,
    plugins,
    output,
    tsconfig: {
      compilerOptions: {
        declaration: declaration ?? false
      }
    },
    compress: (compress && typeof compress == 'boolean') ? compress: false
  }
  
  return configOptions
}