import { dirname, sep, resolve, basename, join } from 'path'
import { copyFile, mkdirp, globFiles, exist, stats } from './fs'

async function getSrcRootDir(src: string) {
  let srcRootDir = dirname(src)
  if (src.includes('**')) {
    srcRootDir = dirname(src).replace(`${sep}**`, '')
  } else {
    if (await exist(src)) {
      const stat = await stats(src)
      if (stat.isDirectory()) {
        srcRootDir = src
      } 
      if (stat.isFile()) {
        srcRootDir = dirname(src)
      }
      mkdirp(srcRootDir)
    }
  }
  return srcRootDir
} 

export interface RollupPluginCopyOptions {
  hook?: string;
  targets?: {
    src: string, 
    dest: string,
    recursive?: boolean
  }[]
}

export async function copyAssets(options?: RollupPluginCopyOptions) {
  const { targets } = options
  return Promise.all(targets.map(async target => {
    const files = await globFiles(target.src)
    await Promise.all(files.map(async file => {
      let destFile = resolve(join(target.dest, basename(file)))
      if (target.recursive && !!target.recursive) {
        const srcRootDir = await getSrcRootDir(target.src)
        destFile = file.replace(srcRootDir, target.dest)
      }         
      mkdirp(dirname(destFile))
      await copyFile(file, destFile)
    }))
  }))
}

export function copy({ hook = 'buildEnd', targets = [] }: RollupPluginCopyOptions) {
  return {
    name: 'copy',
    [hook]: () => copyAssets({ targets })
  }
}