import { buildConfig, } from '../cli/build-config'
import { copyPackageFile, copyReadMeFile, getPackage } from '../utils/utils'
import { PackageFile, DEFAULT_DEST } from '../common/common'

import { esbuild } from './build'
import { esbuildDts } from './build-dts'
import { mkdir } from '../fs/fs'

type CreateRollupConfigOptions = import('../common/common').CreateRollupConfigOptions
type BuildFormatOptions = import('../cli/common').BuildFormatOptions

export interface CreateRollupConfigBuilderOptions extends CreateRollupConfigOptions {
  pkg?: PackageFile
}

async function buildConfigOptions(options: BuildFormatOptions) {
  const { pkgName, output, format, esbuild, swc } = options
  const pkgJson: Pick<PackageFile, 'main' | 'module' | 'name' | 'typings'> = await getPackage()
  const opts: CreateRollupConfigBuilderOptions = {
    name: pkgName,
    config: buildConfig(options),
    esbuild: esbuild,
    swc,
    pkg: { ...pkgJson, output, format }
  }
  return opts
}

export async function createOptions(options: CreateRollupConfigBuilderOptions | BuildFormatOptions) {
  return (!options.config || typeof options.config == 'string')
    ? await buildConfigOptions(options as BuildFormatOptions)
    : options as CreateRollupConfigBuilderOptions
}

export async function esbundle(options: CreateRollupConfigBuilderOptions | BuildFormatOptions) {
  const opts = await createOptions(options)
  await mkdir(opts.pkg?.output ?? DEFAULT_DEST)
  await Promise.all([ 
    esbuild(opts), esbuildDts(opts), 
    copyPackageFile({ ...(opts.pkg ?? {})  }), copyReadMeFile() 
  ])
}