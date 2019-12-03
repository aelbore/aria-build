import * as path from 'path'
import { symlinkDir, exist } from '../src';

export interface LinkOptions {
  outDir?: string,
  targets?: {
    package?: string,
    dest?: string
  }[]
}

export async function linkToPackages(options?: LinkOptions) {
  const { targets, outDir } = options;
  const inputDir = outDir ??  './dist';
  await Promise.all(targets.map(async target => {
    const dest = path.resolve(`./packages/${target.package}/node_modules/aria-build`)
    const isDirExist = await exist(path.dirname(dest))
    if (isDirExist) {       
      await symlinkDir(inputDir, dest)
    }        
  }))
}

export function link(options?: LinkOptions) {
  return {
    name: 'link',
    'buildEnd': () => linkToPackages(options)
  }
}
