import * as fs from 'fs'
import * as util from 'util'

const copyFile = util.promisify(fs.copyFile)
const writeFile = util.promisify(fs.writeFile)
const rename = util.promisify(fs.rename)
const exist = util.promisify(fs.exists)
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)
const stats = util.promisify(fs.stat)

export { copyFile, writeFile, rename, exist, readdir, readFile, stats }
export { globFiles, mkdirp, clean, copyFiles, symlinkDir, unlinkDir } from 'aria-fs'