import { RollupPluginCopyOptions, copyAssets } from './copy-assets'

export function copy(options?: RollupPluginCopyOptions) {
  const hook = options?.hook ?? 'buildEnd'
  const targets = options?.targets ?? []
  return {
    name: 'copy',
    [hook]: async () => {
      await copyAssets({ targets })
      await (options?.copyEnd && options.copyEnd())
    }
  }
}