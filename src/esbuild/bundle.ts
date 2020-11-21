import { buildConfig, } from '../cli/build-config'
import { copyPackageFile, copyReadMeFile, getPackage } from '../utils/utils'
import { PackageFile, DEFAULT_DEST, CreateRollupConfigOptions } from '../common/common'
import { BuildFormatOptions } from '../cli/common'

import { esbuild } from './build'
import { esbuildDts } from './build-dts'
import { mkdir } from '../fs/fs'

const buildConfigOptions = async (options: BuildFormatOptions) => {
  const { pkgName, output, format, esbuild, swc, write, dtsOnly } = options
  const pkgJson: Pick<PackageFile, 'main' | 'module' | 'name' | 'typings'> = await getPackage()
  const opts: CreateRollupConfigBuilderOptions = {
    name: pkgName,
    config: buildConfig(options),
    esbuild: esbuild,
    swc,
    pkg: { ...pkgJson, output, format },
    write,
    dtsOnly
  }
  return opts
}

export interface CreateRollupConfigBuilderOptions extends CreateRollupConfigOptions {
  pkg?: PackageFile
  dtsOnly?: boolean
}

export async function createOptions(options: CreateRollupConfigBuilderOptions | BuildFormatOptions) {
  return (!options.config || typeof options.config == 'string')
    ? await buildConfigOptions(options as BuildFormatOptions)
    : options as CreateRollupConfigBuilderOptions
}

export async function bundle(options: CreateRollupConfigBuilderOptions | BuildFormatOptions) {
  const opts = await createOptions(options)
  const args = { ...(opts.pkg ?? {})  }

  await mkdir(opts.pkg?.output ?? DEFAULT_DEST, { recursive: true })
  await Promise.all([ 
    (!opts.dtsOnly) && esbuild(opts), 
    esbuildDts(opts), 
    copyPackageFile({ ...args }), 
    copyReadMeFile({ ...args }) 
  ])
}