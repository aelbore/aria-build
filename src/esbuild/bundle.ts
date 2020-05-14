import { CreateRollupConfigOptions, RollupConfigBase } from '../config/config'
import { BuildFormatOptions, buildConfig } from '../cli/cli'
import { esbuild, esbuildDts } from './build'
import { copyPackageFile, copyReadMeFile, getPackage } from '../utils/utils'

function createOptions(options: BuildFormatOptions) {
  const opts: CreateRollupConfigOptions = {
    name: options.pkgName,
    config: buildConfig(options),
    esbuild: options.esbuild
  }
  return opts
}

export async function esbundle(options: CreateRollupConfigOptions | BuildFormatOptions) {
  const opts = typeof options.config == 'string' 
    ? createOptions(options as BuildFormatOptions)
    : options as CreateRollupConfigOptions

  await Promise.all([ esbuild(opts), esbuildDts(opts), copyPackageFile(), copyReadMeFile() ])
}