import { join } from 'path'
import { baseDir } from '../common/common'

export async function getPackage(filePath?: string) {
  const pkg = await import(filePath ?? join(baseDir(), 'package.json'))
  return pkg.default || pkg
}

export async function getPackageName(filePath?: string) {
  const pkg = await getPackage(filePath)
  const names: string[] = pkg.name.split('/')
  return (names.length > 1) ? names[1]: names.pop()
}