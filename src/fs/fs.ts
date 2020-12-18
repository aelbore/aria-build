import * as fs from 'fs'
import * as childProcess from 'child_process'
import * as ariaFs from 'aria-fs'

import { promisify } from 'util'

const nodeMajorVersion = parseInt(process.versions.node.split('.')[0])

const exist = promisify(fs.exists)
const exec = promisify(childProcess.exec)

export { exist, exec, nodeMajorVersion }

/// typescript 3.9.x issue 
/// https://github.com/sinonjs/sinon/issues/2258
/// stub if you export { globFiles } from 'aria-fs'
/// rollup warning if you export * from 'aria-fs'
export const globFiles = ariaFs.globFiles
export const mkdirp = ariaFs.mkdirp
export const clean = ariaFs.clean
export const copyFiles = ariaFs.copyFiles
export const symlinkDir = ariaFs.symlinkDir
export const unlinkDir = ariaFs.unlinkDir
export const unlinkFile = ariaFs.unlinkFile
export const symlinkFile = ariaFs.symlinkFile

export * from './fs-promises'