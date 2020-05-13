import { join } from 'path'
import { baseDir } from '../common/common'

export async function getPackage(filePath?: string) {
  const pkg = await import(filePath ?? join(baseDir(), 'package.json'))
  return pkg.default || pkg
}

export async function getPackageName(filePath?: string) {
  const pkg = await getPackage(filePath)
  return pkg.name
}