import * as fs from 'fs'

const copyFile = fs.promises.copyFile
const writeFile = fs.promises.writeFile
const rename = fs.promises.rename
const readdir = fs.promises.readdir
const readFile = fs.promises.readFile
const stats = fs.promises.stat
const unlink = fs.promises.unlink
const symlink = fs.promises.symlink
const fstat = fs.promises.fstat
const readlink = fs.promises.readlink

export { 
  copyFile, 
  writeFile, 
  rename, 
  readdir, 
  readFile, 
  stats,
  unlink,
  symlink,
  fstat,
  readlink
}