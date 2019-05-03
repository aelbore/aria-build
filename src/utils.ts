import * as path from 'path'

import { TSRollupConfig } from './ts-rollup-config'
import { copyFile, writeFile, rename, exist } from './fs'

function pkgProps(options: any, pkgName: string) {
  const { main, module, typings } = options
  return {
    main: main || `${pkgName}.js`,
    module: module || `${pkgName}.es.js`,
    typings: typings || `${pkgName}.d.ts`
  }
}

export interface PackageFile {
  filePath?: string;
  main?: string;
  module?: string;
  typings?: string;
}

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

export async function renameDtsFile(options: { input: string, filePath?: string }) {
  const pkgName = getPackageName(options.filePath)
  const dtsInputFileName = path.basename(options.input, 'ts') + 'd.ts'
  const inputFullPath = path.resolve(path.join(DEFAULT_VALUES.DIST_FOLDER, dtsInputFileName))
  const destFullPath = path.join(path.dirname(inputFullPath), pkgName + '.d.ts')
  const isFileExist = await exist(destFullPath)
  if (!isFileExist) {
    await rename(inputFullPath, destFullPath)
  }
}

export async function copyPackageFile(options: PackageFile = {}) {
  const pkgTemp = getPackageJson(options.filePath)
  const pkg = { ...pkgTemp, ...pkgProps(options, pkgTemp.name) }
  delete pkg.scripts
  delete pkg.devDependencies
  await writeFile(path.join(DEFAULT_VALUES.DIST_FOLDER, 'package.json'), JSON.stringify(pkg, null, 2))
}

export async function renameDtsEntryFile(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = Array.isArray(options) ? options: [ options ]
  const dtsOption = configs.find(option => {
    return option.tsconfig 
      && option.tsconfig.compilerOptions
      && option.tsconfig.compilerOptions.declaration
  })
  if (dtsOption) {
    await renameDtsFile(dtsOption)
  }
}