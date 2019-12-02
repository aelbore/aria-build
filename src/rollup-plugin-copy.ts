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
    recursive?: boolean,
    replace?: (filename: string) => Promise<void>
  }[]
}

export function replace(string: string, needle: string, replacement: string | Function, options = {}) {
  if (typeof string !== 'string') {
		throw new TypeError(`Expected input to be a string, got ${typeof string}`);
	}

	if (!(typeof needle === 'string' && needle.length > 0) ||
		!(typeof replacement === 'string' || typeof replacement === 'function')) {
		return string;
	}

	let result = '';
  let matchCount = 0;
  /// @ts-ignore
	let prevIndex = options.fromIndex > 0 ? options.fromIndex : 0;

	if (prevIndex > string.length) {
		return string;
	}

	while (true) { 
		const index = string.indexOf(needle, prevIndex);

		if (index === -1) {
			break;
		}

		matchCount++;

    const replaceStr = typeof replacement === 'string' 
      ? replacement 
      : replacement(needle, matchCount, string, index);

    const beginSlice = matchCount === 1 
      ? 0 
      : prevIndex;

		result += string.slice(beginSlice, index) + replaceStr;
		prevIndex = index + needle.length;
	}

	if (matchCount === 0) {
		return string;
	}

	return result + string.slice(prevIndex);
}

export async function copyAssets(options?: RollupPluginCopyOptions) {
  const { targets } = options
  await Promise.all(targets.map(async target => {
    const files = await globFiles(target.src)
    await Promise.all(files.map(async file => {
      let destFile = resolve(join(target.dest, basename(file)))
      if (target.recursive && !!target.recursive) {
        const srcRootDir = await getSrcRootDir(target.src)
        destFile = file.replace(srcRootDir, target.dest)
      }         
      mkdirp(dirname(destFile))
      await copyFile(file, destFile)
      if (target.replace) {
        await target.replace(destFile)
      }
    }))
  }))
}

export function copy({ hook = 'buildEnd', targets = [] }: RollupPluginCopyOptions) {
  return {
    name: 'copy',
    [hook]: () => copyAssets({ targets })
  }
}