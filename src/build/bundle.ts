import { TSRollupConfig } from '../config/config'
import { copyPackageFile, copyReadMeFile, renameDtsEntryFile, moveDtsFiles } from '../utils/utils'
import { build, ebuild } from './build'

async function bundleAssets(config: TSRollupConfig | Array<TSRollupConfig>) {
  await Promise.all([ copyPackageFile(), copyReadMeFile(), renameDtsEntryFile({ config }) ])
  await moveDtsFiles()
}

export async function bundle(options: TSRollupConfig | Array<TSRollupConfig>) {
  await build(options)
  await bundleAssets(options)
}

export async function ebundle(config: TSRollupConfig) {
  await ebuild({ config })
  await bundleAssets(config)
}