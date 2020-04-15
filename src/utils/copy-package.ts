import { basename, parse, join } from 'path'

import { writeFile } from '../fs/fs'

import { PackageFile, DEFAULT_DEST } from './common'
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
  const pkgTemp = options?.name ? options: await getPackage(options?.filePath)
  const name = options?.entry ? getInputEntryFile(options.entry): pkgTemp.name

  await deleteKeys(pkgTemp)

  const { main, typings, format } = (options ?? {})
  const module = options?.module ?? getModule({ format, name })
  
  const pkg = { 
    ...pkgTemp,  
    ...{ main: main ?? `${name}.js`  },
    ...{ typings: typings ?? `${name}.d.ts` },
    ...{ module }
  }

  const outfile = join((options?.output ?? DEFAULT_DEST), 'package.json')
  await writeFile(outfile, JSON.stringify(pkg, null, 2))
}