import { join, dirname, sep } from 'path'
import { globFiles, mkdir, rename, clean, writeFile, exist } from '../fs/fs'
import { getInputEntryFile, DEFAULT_DEST, DEFAULT_SOURCE } from './common'
import { getPackageName } from './get-package'

export interface MoveDtsOptions {
  entry?: string
  output?: string 
  name?: string
}

export interface MoveFilesDtsOptions extends Omit<MoveDtsOptions, 'output'> {
  outDir?: string
  files?: string[]
}

async function writeDtsFile(entry: string, outDir: string) {
  const name = getInputEntryFile(entry)
  const outfile = join(outDir, `${name}.d.ts`)
  await writeFile(outfile, `export * from './src/${name}'`)
}

async function cleanSubfolders(files: string[], outDir: string) {
  const dirnames = await Promise.all(files.map(file => dirname(file)))
  const folders = [ ...new Set(dirnames.filter(folder => folder !== `.${sep}${outDir}`)) ]
  await Promise.all(folders.map(folder => clean(folder)))
}

async function createDtsEntry(outDir: string, name?: string) {
  name = name ?? await getPackageName()
  const indexDts = join(outDir, DEFAULT_SOURCE, 'index.d.ts')
  
  const content = await exist(indexDts) 
    ? `export * from './src/index'`
    : `export * from './src/${name}'` 
  
  const outfile = join(outDir, `${name}.d.ts`)
  await writeFile(outfile, content)
}

async function moveFiles(options: MoveFilesDtsOptions) {
  const { files, outDir, entry, name } = options
  const destFolder = join(outDir, DEFAULT_SOURCE)
  
  await Promise.all(files.map(async (file: string) => {
    const destFile = join(destFolder, file.replace(`.${sep}${outDir}${sep}`, ''))
    await mkdir(dirname(destFile), { recursive: true })
    await rename(file, destFile)
  }))
  
  await cleanSubfolders(files, outDir)

  entry 
    ? await writeDtsFile(entry, outDir)
    : await createDtsEntry(outDir, name)
}

export async function moveDtsFiles(options?: MoveDtsOptions) {
  const outDir = options?.output ?? DEFAULT_DEST
  const files = await globFiles(join(outDir, '**/*.d.ts'), true)
  files.length > 1 
    && await moveFiles({ files, outDir, ...options })
}