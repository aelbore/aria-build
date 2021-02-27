import { promises } from 'fs'

const { copyFile, writeFile, rename, readdir, readFile, stat, unlink, symlink, readlink, mkdir, lstat } = promises

export { copyFile, writeFile, rename, readdir, readFile, stat as stats, unlink, symlink, readlink, mkdir, lstat }