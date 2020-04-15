import * as path from 'path'
import { symlinkDir, exist } from '../fs/fs';

export interface LinkOptions {
  hook?: string;
  moduleDir?: string;
  outDir?: string;
  targets?: {
    package?: string,
    dest?: string
  }[]
}

export function linkToPackages(options: LinkOptions) {
  const { targets, outDir, moduleDir } = options;
  return {
    name: 'link-packages',
    [options.hook ?? 'buildEnd']: async () => {
      const inputDir = outDir ??  './dist';
      await Promise.all(targets.map(async target => {
        const dest = path.resolve(
          `./packages/${target.package}/node_modules/${moduleDir}`
        )
        const isDirExist = await exist(path.dirname(dest))
        if (isDirExist) {       
          await symlinkDir(inputDir, dest)
        }        
      }))
    }
  }
}
