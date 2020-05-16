import { CreateRollupConfigOptions } from '../config/config'
import { buildConfig, } from '../cli/build-config'
import { BuildFormatOptions } from '../cli/common';
import { copyPackageFile, copyReadMeFile } from '../utils/utils'

import { esbuild } from './build'
import { esbuildDts } from './build-dts'

function buildConfigOptions(options: BuildFormatOptions) {
  const opts: CreateRollupConfigOptions = {
    name: options.pkgName,
    config: buildConfig(options),
    esbuild: options.esbuild
  }
  return opts
}

export function createOptions(options: CreateRollupConfigOptions | BuildFormatOptions) {
  return (!options.config || typeof options.config == 'string')
    ? buildConfigOptions(options as BuildFormatOptions)
    : options as CreateRollupConfigOptions
}

export async function esbundle(options: CreateRollupConfigOptions | BuildFormatOptions) {
  const opts = createOptions(options)
  await Promise.all([ esbuild(opts), esbuildDts(opts), copyPackageFile(), copyReadMeFile() ])
}