import { CreateRollupConfigOptions } from '../config/config'
import { BuildFormatOptions, buildConfig } from '../cli/cli'
import { copyPackageFile, copyReadMeFile } from '../utils/utils'

import { esbuild, esbuildDts } from './build'

function buildConfigOptions(options: BuildFormatOptions) {
  const opts: CreateRollupConfigOptions = {
    name: options.pkgName,
    config: buildConfig(options),
    esbuild: options.esbuild
  }
  return opts
}

export function createOptions(options: CreateRollupConfigOptions | BuildFormatOptions) {
  return (typeof options.config == 'string')
    ? buildConfigOptions(options as BuildFormatOptions)
    : options as CreateRollupConfigOptions
}

export async function esbundle(options: CreateRollupConfigOptions | BuildFormatOptions) {
  const opts = createOptions(options)
  await Promise.all([ esbuild(opts), esbuildDts(opts), copyPackageFile(), copyReadMeFile() ])
}