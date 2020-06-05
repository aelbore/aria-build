import { globFiles, mkdir, copyFile, readFile, writeFile } from '../fs/fs'
import { basename, join, dirname, sep, extname } from 'path'
import { replace } from './replace'

 /* istanbul ignore next */
export function isGlob(file: string) {
  return /(\*.*)|(\*.[a-z]{2})/g.test(file) 
}

export interface TargetCopyOptions {
  src: string, 
  dest: string,
  recursive?: boolean,
  replace?: (filename: string) => Promise<void>
}

export interface RollupPluginCopyOptions {
  hook?: string;
  targets?: TargetCopyOptions[],
  copyEnd?: () => Promise<void>
}

 /* istanbul ignore next */
export async function replaceContent(options?: { 
  filename?: string, 
  strToFind?: string, 
  strToReplace?: string,
  extensions?: string[]
}) {
  const extensions = [ '.js', ...(options?.extensions ?? []) ]
  const { filename, strToFind, strToReplace } = options
  if (extensions.includes(extname(filename))) {
    let content = await readFile(filename, 'utf8')
    if (content.includes(strToFind)) {
      content = replace(content, strToFind, strToReplace)
      await writeFile(filename, content)
    }
  }
}

export function createOutfile(file: string, dest: string, recursive: boolean) {
  if (recursive) {
    const paths = [ ...file.replace(`.${sep}`, '').split(sep) ]
    paths.shift()
    return join(dest, paths.join(sep))
  }
  return join(dest, basename(file))
}

export async function copyAssets(options?: RollupPluginCopyOptions) {
  const { targets } = options
  await Promise.all(targets.map(async target => {
    const files = await globFiles(target.src, true)
    await Promise.all(files.map(async file => {
      const outfile = createOutfile(file, target.dest, target.recursive)
      await mkdir(dirname(outfile), { recursive: true })
      await copyFile(file, outfile)
      target.replace 
        && await target.replace(outfile)
    }))
  }))
}