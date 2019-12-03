import { dirname, resolve, basename, join } from 'path'

import { TSRollupConfig } from './ts-rollup-config'
import { copyFile, writeFile, rename, exist } from './fs'
import { globFiles, mkdirp } from 'aria-fs'

function pkgProps(options: any, pkgName: string) {
  const { main, module, typings, format } = options
  return {
    main: main || `${pkgName}.js`,
    module: module 
      || ((format?.split(',').length === 1) 
            ? `${pkgName}.js`
            : `${pkgName}.es.js`),
    typings: typings || `${pkgName}.d.ts`
  }
}

export function getInputEntryFile(input: string) {
  return basename(input).replace('.ts', '').replace('.js', '');
}

export async function createDtsEntry(options?: { filePath?: string, output?: string }) {
  const outDir = options?.output ?? DEFAULT_VALUES.DIST_FOLDER;

  const name = getPackageName(options?.filePath)
  const indexDts = resolve(join(outDir, DEFAULT_VALUES.SOURCE_FOLDER, 'index.d.ts'))

  let content = `export * from './src/${name}'`
  if (await exist(indexDts)) {
    content = `export * from './src/index'`
  }
 
  await writeFile(
    resolve(join(outDir, name + '.d.ts')), 
    content
  )
}

export interface PackageFile {
  filePath?: string;
  main?: string;
  module?: string;
  typings?: string;
  entry?: string;
  output?: string;
  format?: string;
}

export function baseDir() {
  return process.env.APP_ROOT_PATH ?? resolve()
}

export const DEFAULT_VALUES = Object.freeze({
  DIST_FOLDER: join(baseDir(), 'dist'),
  SOURCE_FOLDER: join(baseDir(), 'src'),
  ROLLUP_EXTERNALS: [ 'path', 'fs', 'util', 'crypto', 'events', 'http', 'net', 'url']
})

export function getPackageJson(filePath?: string) {
  filePath = filePath ?? join(baseDir(), 'package.json')
  return require(filePath)
}

export function getPackageName(filePath?: string) {
  const pkg = getPackageJson(filePath)
  return pkg.name
}

export function copyReadmeFile(filePath?: string) {
  return copyReadMeFile({ filePath, output: DEFAULT_VALUES.DIST_FOLDER })
}

export function copyReadMeFile(options?: { filePath?: string, output?: string }) {
  const fileName = 'README.md'
  return copyFile(options?.filePath ?? join(baseDir(), fileName), join(options?.output, fileName))
}

export async function moveDtsFiles(options: { 
  files?: string[], 
  folder?: string, 
  entry?: string,
  output?: string 
} = {}) {
  const outDir = options?.output ?? DEFAULT_VALUES.DIST_FOLDER;

  const files = (!options.files) 
    ? await globFiles(join(outDir, '**/*.d.ts'))
    : options.files

  const destFolder = join(outDir, 'src')

  if (files.length > 1) {
    mkdirp(destFolder)

    await Promise.all(files.map(file => {
      const destFile = join(destFolder, basename(file))
      return rename(file, destFile)
    }))

    if (options.entry) {
      const name = getInputEntryFile(options.entry)
      await writeFile(join(outDir, `${name}.d.ts`), `export * from './src/${name}'`)
    } else {
      await createDtsEntry({ output: outDir })
    }
  }
}

export async function renameDtsFile(options: { 
  input: string, 
  output?: { file?: string }, 
  filePath?: string 
}) {
  const { filePath, output, input  } = options
  const outDir = output?.file ? dirname(output?.file): DEFAULT_VALUES.DIST_FOLDER;

  const pkgName = getPackageName(filePath)
  const dtsInputFileName = basename(join(baseDir(), input), 'ts') + 'd.ts'
  const inputFullPath = join(outDir, dtsInputFileName)
  
  const destFullPath = join(dirname(inputFullPath), 
    (getInputEntryFile(input).includes(pkgName) || getInputEntryFile(input).includes('index'))
      ? pkgName + '.d.ts'
      : getInputEntryFile(input) + '.d.ts'
  )

  const isFileExist = await exist(destFullPath)
  if (!isFileExist) {
    await rename(inputFullPath, destFullPath)
  }
}

export async function renameDtsEntryFile(options: TSRollupConfig | Array<TSRollupConfig>, entry?: string) {
  const configs = Array.isArray(options) ? options: [ options ]
  const dtsOption = configs.find(option => {
    return option.tsconfig 
      && option.tsconfig.compilerOptions
      && option.tsconfig.compilerOptions.declaration
  })
  if (dtsOption) {
    dtsOption.input = entry ?? dtsOption.input;
    await renameDtsFile(dtsOption)
  }
}

export async function copyPackageFile(options?: PackageFile) {
  const pkgTemp = getPackageJson(options?.filePath)
  const name = options?.entry ? getInputEntryFile(options?.entry): pkgTemp.name
  const pkg = { ...pkgTemp, ...pkgProps(options ?? {}, name) }
  delete pkg.scripts
  delete pkg.devDependencies
  await writeFile(join(options?.output ?? DEFAULT_VALUES.DIST_FOLDER, 'package.json'), JSON.stringify(pkg, null, 2))
}