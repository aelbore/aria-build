import { basename, parse, join } from 'path'

import { writeFile } from '../fs/fs'

import { PackageFile, DEFAULT_DEST } from '../common/common'
import { getPackage } from './get-package'

function getInputEntryFile(input: string) {
  return parse(basename(input)).name
}

function getModule(options: { format?: string, name: string }) {
  const formats = options.format?.split(',') ??  []
  return (formats.includes('es') && formats.length > 1)
    ? `${options.name}.es.js`
    : `${options.name}.js`
}

async function deleteKeys(pkg: PackageFile) {
  const keys = ['scripts', 'devDependencies', 'entry', 'output', 'format', 'filePath']
  await Promise.all(keys.map(key => delete pkg[key]))
}

export async function copyPackageFile(options?: PackageFile) {
  const { filePath, entry, typings, format } = (options ?? {})

  const pkgTemp = options?.name ? options: await getPackage(filePath)
  const name = entry ? getInputEntryFile(options.entry): pkgTemp.name
  const outfile = join((options?.output ?? DEFAULT_DEST), 'package.json')

  await deleteKeys(pkgTemp)
  
  const formats = format?.split(',') ?? []
  const module = options?.module ?? `./${getModule({ format, name })}`
  const main =  options?.main ?? formats.includes('cjs') ? `./cjs/${name}.js`: `${name}.js` 
  
  const pkg = { 
    ...pkgTemp,  
    main,
    ...{ typings: typings ?? `./${name}.d.ts` },
    ...{ module },
    ...(formats.length > 0 && (formats.includes('es') || formats.includes('cjs'))
         ? {
            exports: {
              ...(formats.includes('cjs') ? { require: main }: {}),
              ...(formats.includes('es') ? { import: module }: {})
            }   
          }
         : {})
  }

  await writeFile(outfile, JSON.stringify(pkg, null, 2))
}