import * as path from 'path'
import * as util from 'util'
import * as fs from 'fs'

const copyFile = util.promisify(fs.copyFile)
const writeFile = util.promisify(fs.writeFile)

export const DEFAULT_VALUES = Object.freeze({
  DIST_FOLDER: 'dist',
  SOURCE_FOLDER: 'src',
  ROLLUP_EXTERNALS: [
    'path', 'fs', 'util'
  ]
})

export function getPackageJson(filePath?: string) {
  filePath = filePath ? path.resolve(filePath)
    : path.resolve('package.json')
  return require(filePath)
}

export function getPackageName(filePath?: string) {
  const pkg = getPackageJson(filePath)
  return pkg.name
}

export function copyReadmeFile(filePath?: string) {
  const fileName = 'README.md'
  filePath = filePath ? path.resolve(filePath): path.resolve(fileName)
  return copyFile(filePath, path.join(DEFAULT_VALUES.DIST_FOLDER, fileName))
}

export function copyPackageFile(filePath?: string) {
  const pkg = getPackageJson(filePath)
  delete pkg.scripts
  delete pkg.devDependencies
  return writeFile(path.join(DEFAULT_VALUES.DIST_FOLDER, 'package.json'), JSON.stringify(pkg, null, 2))
}