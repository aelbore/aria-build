import { dirname, resolve, basename, join } from 'path'
import { globFiles, mkdirp } from 'aria-fs'

import { TSRollupConfig } from './ts-rollup-config'
import { copyFile, writeFile, rename, exist } from './fs'
import { DEFAULT_OUT_DIR } from './cli-common'

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

async function renameDtsFile(options: { 
  input: string | string[], 
  output?: { file?: string }, 
  filePath?: string 
}) {
  const { filePath, output, input  } = options
  const outDir = output.file ? dirname(output.file): DEFAULT_VALUES.DIST_FOLDER;

  const pkgName = getPackageName(filePath)

  if (Array.isArray(input)) {
    const dtsFiles = await globFiles(`./${outDir}/**/*.d.ts`)
      .then(files => {
        return files.map(file => {
          const value = file
            .replace(join(resolve(), outDir), '.') 
            .replace(/\\/g, '/')
            .replace('.d.ts', '')          
          return `export * from '${value}'`
        })
      })
    await writeFile(`./${outDir}/${pkgName}.d.ts`, dtsFiles.join('\n'))
  }

  const inputEntry = Array.isArray(input)
    ? pkgName
    : getInputEntryFile(input)

  const dtsInputFileName = inputEntry + '.d.ts'
  const inputFullPath = join(outDir, dtsInputFileName)
  
  const destFullPath = join(dirname(inputFullPath), 
    (inputEntry.includes(pkgName) || inputEntry.includes('index'))
      ? pkgName + '.d.ts'
      : inputEntry + '.d.ts'
  )

  const isFileExist = await exist(destFullPath)
  if (!isFileExist) {
    await rename(inputFullPath, destFullPath)
  }
}

export const DEFAULT_VALUES = Object.freeze({
  DIST_FOLDER: join(baseDir(), DEFAULT_OUT_DIR),
  SOURCE_FOLDER: join(baseDir(), 'src'),
  ROLLUP_EXTERNALS: [ 'child_process', 'path', 'fs', 'util', 'crypto', 'events', 'http', 'net', 'url']
})

export interface PackageFile {
  filePath?: string;
  main?: string;
  module?: string;
  typings?: string;
  entry?: string;
  output?: string;
  format?: string;
  name?: string;
}

export function getInputEntryFile(input: string) {
  return basename(input).replace('.ts', '').replace('.js', '');
}

export function baseDir() {
  return process.env.APP_ROOT_PATH ?? resolve()
}

export function getPackageJson(filePath?: string) {
  filePath = filePath ?? join(baseDir(), 'package.json')
  return require(filePath)
}

export async function getPackageJsonFile(filePath?: string) {
  const pkg = await import(filePath ?? join(baseDir(), 'package.json'))
  return pkg.default || pkg
}

export function getPackageName(filePath?: string) {
  const pkg = getPackageJson(filePath)
  return pkg.name
}

export function copyReadmeFile(filePath?: string) {
  return copyReadMeFile({ filePath, output: DEFAULT_VALUES.DIST_FOLDER })
}

export async function createDtsEntry(options?: { 
  filePath?: string, 
  output?: string 
}) {
  const pkg = await getPackageJsonFile(options?.filePath)

  const name = pkg.name
  const outDir = options?.output ?? DEFAULT_VALUES.DIST_FOLDER;
  const indexDts = join(outDir, 'src', 'index.d.ts')

  let content = `export * from './src/${name}'`
  if (await exist(indexDts)) {
    content = `export * from './src/index'`
  }
  
  await writeFile(`${outDir}/${name}.d.ts`, content)
}

export function copyReadMeFile(options?: { 
  filePath?: string, 
  output?: string 
}) {
  const fileName = 'README.md'
  const src = options?.filePath ?? join(baseDir(), fileName);
  const dst = join(options?.output, fileName)
  return copyFile(src, dst)
}

export async function moveDtsFiles(options: { 
  files?: string[], 
  folder?: string, 
  entry?: string,
  output?: string 
} = {}) {
  const outDir = options?.output ?? DEFAULT_VALUES.DIST_FOLDER;
  const files = options?.files ?? await globFiles(join(outDir, '**/*.d.ts'), true)
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
  const pkgTemp = options?.name ? options: await getPackageJsonFile(options?.filePath)
  const name = options?.entry ? getInputEntryFile(options?.entry): pkgTemp.name
  const pkg = { ...pkgTemp, ...pkgProps(options ?? {}, name) }
  delete pkg.scripts
  delete pkg.devDependencies
  delete pkg.entry
  delete pkg.output
  await writeFile(join(options?.output ?? DEFAULT_VALUES.DIST_FOLDER, 'package.json'), JSON.stringify(pkg, null, 2))
}