import { TSRollupConfig } from '../config/config'
import { build } from './build'
import { copyPackageFile, copyReadMeFile, renameDtsEntryFile, moveDtsFiles } from '../utils/utils'

export async function bundle(options: TSRollupConfig | Array<TSRollupConfig>) {
  await build(options)
  await Promise.all([ copyPackageFile(), copyReadMeFile(), renameDtsEntryFile({ config: options }) ])
  await moveDtsFiles()
}