import * as path from 'path'
import { symlinkDir, exist } from "../src";

export interface LinkOptions {
  targets?: {
    package?: string,
    dest?: string
  }[]
}

export async function linkToPackages(options?: LinkOptions) {
  const { targets } = options;
  await Promise.all(targets.map(async target => {
    const dest = path.resolve(`./packages/${target.package}/node_modules/aria-build`)
    const isDirExist = await exist(path.dirname(dest))
    if (isDirExist) {       
      await symlinkDir('./dist', dest)
    }        
  }))
}

export function link(options?: LinkOptions) {
  return {
    name: 'link',
    'buildEnd': () => linkToPackages(options)
  }
}
