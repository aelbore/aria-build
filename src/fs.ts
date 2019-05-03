import * as fs from 'fs'
import * as util from 'util'

const copyFile = util.promisify(fs.copyFile)
const writeFile = util.promisify(fs.writeFile)
const rename = util.promisify(fs.rename)
const exist = util.promisify(fs.exists)

export { copyFile, writeFile, rename, exist }