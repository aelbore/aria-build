import * as fs from 'fs'

import { resolve, join } from 'path'

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

export function getGlobals(globals: string = '') {
  const results = globals.split(',')
  const values = {}

  results.forEach(result => {
    const value = result.split('=')
    values[value[0]] = value[1]
  })

  return values
}

export function getExternal({ external, dependencies }) {
  return [
    ...(external 
          ? external.split(',')
          : dependencies
        )
  ]
}

export function getEntryFile(pkgName: string) {
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