import { resolve, basename, join, parse } from 'path'
import { builtinModules } from 'module'

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

export function onwarn(options: { code: string, message: string }) {
  !options.code.includes('THIS_IS_UNDEFINED') 
    && console.log('Rollup warning: ', options.message)
}