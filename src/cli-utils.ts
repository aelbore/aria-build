import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { terser } from './libs'
import { KeyValue, AriaConfigOptions } from './cli-common'

function getGlobals(globals: string = '') {
  const results = globals.split(',')
  const values = {}

  results.forEach(result => {
    const value = result.split('=')
    values[value[0]] = value[1]
  })

  return values
}

function createGlobals(globals: KeyValue) {
  const keys = Object.keys(globals)
  return keys.map(key => {
    return `${key}=${globals[key]}`
  })
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

  if (existsSync(tsPkgPath)) return removeRootDir(tsPkgPath)

  if (existsSync(jsPkgPath)) return removeRootDir(jsPkgPath)

  if (existsSync(tsIndexPath)) return removeRootDir(tsIndexPath)

  if (existsSync(jsIndexPath)) return removeRootDir(jsIndexPath)

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

export function mergeGlobals(globals?: KeyValue, optionGlobals?: string) {
  const localConfigGlobals = globals ? createGlobals(globals): []
  const localOptionGlobals = optionGlobals ? optionGlobals.split(','): []
  return ([].concat(localConfigGlobals, localOptionGlobals)).join(',') 
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

export async function getAriaConfig(config?: string) {
  const ROLLUP_CONFIG_PATH = resolve(config ?? 'aria.config.ts')
  if (existsSync(ROLLUP_CONFIG_PATH)) {
    const ariaConfig: AriaConfigOptions = await import(ROLLUP_CONFIG_PATH).then(c => c.default)
    return ariaConfig
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
export const createGlobalsFromConfig = memoize(createGlobals)