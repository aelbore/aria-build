import { resolve, join, dirname } from 'path'
import { existsSync } from 'fs'
import { KeyValue, AriaConfigOptions, PluginOptions } from './cli-common'

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

function getExternal(options?: { external: string, dependencies: string[] }) {
  return [ 
    ...(options?.external ? options.external.split(','): []), 
    ...(options?.dependencies ?? [])
  ]
}

export function parseConfig(config?: string, entry?: string) {
  const c = 'aria.config.ts'
  if (config) {
    return config
  }
  if (entry) {
    const filePath = join(dirname(entry), c)
    if (existsSync(filePath)) {
      return filePath
    }
  }
  return c
}

export function isCompress(compress: string | boolean, format: string) {
  return ((typeof compress == "string" && compress.includes(format)) 
    || (typeof compress == "boolean" && compress))
}

export function parsePlugins(plugins: PluginOptions) {
  return Array.isArray(plugins) 
    ? [ ...plugins ]
    : {  
        before: [ 
          ...(plugins?.before || []) 
        ], 
        after: [ 
          ...(plugins?.after || [])
        ]   
      } 
      || { before: [], after: []  }
}

export function getEntryFile(pkgName: string) {
  const rootDir = resolve()
  const tsPkgPath = join(rootDir, 'src', `${pkgName}.ts`)
  const jsPkgPath = tsPkgPath.replace('.ts', '.js')
  const tsIndexPath = join(rootDir, 'src', 'index.ts')
  const jsIndexPath = tsIndexPath.replace('.ts', '.js')
  
  const removeRootDir = (filePath: string) => filePath.replace(rootDir, '.')

  if (existsSync(tsPkgPath)) return removeRootDir(tsPkgPath)

  if (existsSync(jsPkgPath)) return removeRootDir(jsPkgPath)

  if (existsSync(tsIndexPath)) return removeRootDir(tsIndexPath)

  if (existsSync(jsIndexPath)) return removeRootDir(jsIndexPath)

  throw new Error('Entry file is not exist.')
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

export async function getAriaConfig(config?: string): Promise<AriaConfigOptions> { 
  const ROLLUP_CONFIG_PATH = resolve(config ?? 'aria.config.ts')
  if (existsSync(ROLLUP_CONFIG_PATH)) {
    const ariaConfig = await import(ROLLUP_CONFIG_PATH).then(c => c.default)
    return ariaConfig
  }
  return null
}

export function entryFile(format?: string, entry?: string, module?: string) {
  return (format?.split(',').length === 1) ? `${entry}.js`: `${entry}.${module ?? 'es'}.js`
}

export const getExternalDeps = memoize(getExternal)
export const getUmdGlobals = memoize(getGlobals)
export const createGlobalsFromConfig = memoize(createGlobals)