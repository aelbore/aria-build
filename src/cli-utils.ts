import * as fs from 'fs'

import { resolve, join } from 'path'
import { terser } from './libs'

function getGlobals(globals: string = '') {
  const results = globals.split(',')
  const values = {}

  results.forEach(result => {
    const value = result.split('=')
    values[value[0]] = value[1]
  })

  return values
}

function getExternal({ external, dependencies }) {
  return [
    ...(external 
          ? external.split(',')
          : dependencies
        )
  ]
}

function getEntryFile(pkgName: string) {
  const rootDir = resolve()
  const tsPkgPath = join(rootDir, 'src', `${pkgName}.ts`),
    jsPkgPath = tsPkgPath.replace('.ts', '.js'),
    tsIndexPath = join(rootDir, 'src', 'index.ts'),
    jsIndexPath = tsIndexPath.replace('.ts', '.js')
  
  const removeRootDir = (filePath: string) => filePath.replace(rootDir, '.')

  if (fs.existsSync(tsPkgPath)) return removeRootDir(tsPkgPath)

  if (fs.existsSync(jsPkgPath)) return removeRootDir(jsPkgPath)

  if (fs.existsSync(tsIndexPath)) return removeRootDir(tsIndexPath)

  if (fs.existsSync(jsIndexPath)) return removeRootDir(jsIndexPath)

  throw new Error('Entry file is not exist.')
}

function addTerserPlugins(plugins: any[], compress: boolean) {
  if (compress) {
    plugins.push(terser({
      output: {
        comments: false
      }
    }))
  }
}

export function memoize(fn: any){
  let cache = {};
  return (...args) => {
    let index = JSON.stringify(args);
    if (index in cache) {
      return cache[index];
    }
    else {
      return (cache[index] = fn.apply(this, args));
    }
  }
}

export async function getRollupPlugins(config?: string) {
  const ROLLUP_CONFIG_PATH = resolve(config ?? 'aria.config.ts')
  if (fs.existsSync(ROLLUP_CONFIG_PATH)) {
    const rollupConfig = require(ROLLUP_CONFIG_PATH)
    if (rollupConfig.default.plugins) {
      return rollupConfig.default.plugins
    }
  }
  return null
}

export function entryFile(format?: string, entry?: string, module?: string) {
  return (format?.split(',').length === 1) ? `${entry}.js`: `${entry}.${module ?? 'es'}.js`
}

export const getInputFile = memoize(getEntryFile)
export const getExternalDeps = memoize(getExternal)
export const getUmdGlobals = memoize(getGlobals)
export const addTerserPlugin = memoize(addTerserPlugins)