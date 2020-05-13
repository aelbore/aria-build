import { resolve, basename, join, parse } from 'path'
import { builtinModules } from 'module'

export interface KeyValue {
	[key: string]: string;
}

export type PluginOptions = any[] | PluginBeforeAfter

export interface PluginBeforeAfter {
	before?: any[];
	after?: any[];
}

export const DEFAULT_DEST = 'dist'
export const DEFAULT_SOURCE = 'src'

export const DEFAULT_VALUES = Object.freeze({
  DIST_FOLDER: join(baseDir(), DEFAULT_DEST),
  SOURCE_FOLDER: join(baseDir(), DEFAULT_SOURCE),
  ROLLUP_EXTERNALS: [ 
    'child_process', 'path', 'fs', 'stream', 'util', 'crypto', 'events', 'http', 'net', 'url',
    ...builtinModules
  ]
})

export interface PackageFile {
  filePath?: string
  entry?: string
  output?: string
  format?: string
  name?: string
  main?: string
  module?: string
  typings?: string
  dependencies?: KeyValue
  devDependencies?: KeyValue
  peerDependencies?: KeyValue
}

export function baseDir() {
  return process.env.APP_ROOT_PATH ?? resolve()
}

export function getInputEntryFile(input: string) {
  return parse(basename(input)).name
}

export function getPackageNameSync(filePath?: string) {
  const pkg = require(filePath ?? join(baseDir(), 'package.json'))
  return pkg.name
} 