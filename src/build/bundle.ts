import { TSRollupConfig } from '../config/config'
import { copyPackageFile, copyReadMeFile, renameDtsEntryFile, moveDtsFiles } from '../utils/utils'
import { build, __build } from './build'

async function bundleAssets(config: TSRollupConfig | Array<TSRollupConfig>) {
  await Promise.all([ copyPackageFile(), copyReadMeFile(), renameDtsEntryFile({ config }) ])
  await moveDtsFiles()
}

export async function bundle(options: TSRollupConfig | Array<TSRollupConfig>) {
  await build(options)
  await bundleAssets(options)
}

export async function __bundle(config: TSRollupConfig) {
  await __build({ config })
  await bundleAssets(config)
}