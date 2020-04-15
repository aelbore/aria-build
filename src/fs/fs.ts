import * as fs from 'fs'
import * as util from 'util'
import * as childProcess from 'child_process'

const nodeMajorVersion = parseInt(process.versions.node.split('.')[0])

const exist = util.promisify(fs.exists)
const exec = util.promisify(childProcess.exec)

export { exist, exec, nodeMajorVersion }
export { globFiles, mkdirp, clean, copyFiles, symlinkDir, symlinkFile, unlinkDir, unlinkFile } from 'aria-fs'

export * from './fs-promises'