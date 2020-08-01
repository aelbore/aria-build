import { dirname, join } from 'path'
import { existsSync } from 'fs'
import { PackageFile, KeyValue, PluginOptions } from '../common/common'

export interface ExternalDepsOptions {
  external?: string
  dependencies?: string[]
}

export function getExternalDeps(options: ExternalDepsOptions) {
  return [ 
    ...(options.external?.split(',') ?? []), 
    ...(options.dependencies ?? [])
  ]
}

export function entryFile(formats: string[] | string, entry: string, module?: string) {
  return (Array.isArray(formats) ? formats: [ formats ]).length === 1
    ? `${entry}.js`
    : `${entry}.${module ?? 'es'}.js`
}

export function updateExternalWithResolve(options: { 
  resolve?: boolean | string, 
  external?: string[] 
} = {}) {
  const { resolve, external } = options
  if (typeof resolve == "boolean" && resolve) {
    return []
  }
  if (typeof resolve == "string") {
    const resolves = resolve.split(',')
    const externals = external.filter(value => (!resolves.includes(value)))
    return externals
  }
  return external ?? []
}

export function parseConfig(options?: { config?: string, entry?: string }) {
  if (options?.config) {
    return options.config
  }

  const c = 'aria.config.ts'
  if (options?.entry) {
    const filePath = join(dirname(options.entry), c)
    if (existsSync(filePath)) {
      return filePath
    }
  }

  return c
}

export function getPkgDependencies(pkgJson: PackageFile) {
  const dependencies = pkgJson.dependencies 
    ? Object.keys(pkgJson.dependencies): []
  const devDependencies = pkgJson.devDependencies
    ? Object.keys(pkgJson.devDependencies): []
  const peerDependencies = pkgJson.peerDependencies
    ? Object.keys(pkgJson.peerDependencies): []

  return [ ...dependencies, ...devDependencies, ...peerDependencies ]
}

export function mergeGlobals(globals?: KeyValue, optionGlobals?: string) {
  function createGlobals(globals: KeyValue) {
    const keys = Object.keys(globals)
    return keys.map(key => {
      return `${key}=${globals[key]}`
    })
  }
  const localConfigGlobals = globals ? createGlobals(globals): []
  const localOptionGlobals = optionGlobals ? optionGlobals.split(','): []
  return [ ...new Set([ ...localConfigGlobals, ...localOptionGlobals ]) ].join(',') 
}

export function mergeExternal(externals: string, external: string[]) {
  return ([ ...(externals?.split(',') ?? []), ...(external ?? []) ]).join(',')
}

export function parsePlugins(plugins?: PluginOptions) {
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
}