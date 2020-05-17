import { CreateRollupConfigOptions } from '../config/config'
import { buildConfig, } from '../cli/build-config'
import { BuildFormatOptions } from '../cli/common';
import { copyPackageFile, copyReadMeFile, getPackage } from '../utils/utils'
import { PackageFile, DEFAULT_DEST } from '../common/common'

import { esbuild } from './build'
import { esbuildDts } from './build-dts'
import { mkdir } from '../fs/fs'

export interface CreateRollupConfigOptionsEsbuild extends CreateRollupConfigOptions {
  pkg?: PackageFile
}

async function buildConfigOptions(options: BuildFormatOptions) {
  const { pkgName, output, format, esbuild } = options
  const pkgJson: Pick<PackageFile, 'main' | 'module' | 'name' | 'typings'> = await getPackage()
  const opts: CreateRollupConfigOptionsEsbuild = {
    name: pkgName,
    config: buildConfig(options),
    esbuild: esbuild,
    pkg: { ...pkgJson, output, format }
  }
  return opts
}

export async function createOptions(options: CreateRollupConfigOptionsEsbuild | BuildFormatOptions) {
  return (!options.config || typeof options.config == 'string')
    ? await buildConfigOptions(options as BuildFormatOptions)
    : options as CreateRollupConfigOptionsEsbuild
}

export async function esbundle(options: CreateRollupConfigOptionsEsbuild | BuildFormatOptions) {
  const opts = await createOptions(options)
  await mkdir(opts.pkg?.output ?? DEFAULT_DEST)
  await Promise.all([ 
    esbuild(opts), esbuildDts(opts), 
    copyPackageFile({ ...(opts.pkg ?? {})  }), copyReadMeFile() 
  ])
}