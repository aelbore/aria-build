import { RollupConfigBase } from './base-rollup-config';
import { exist } from './fs'

export async function findTargetBuild(target: string, config: RollupConfigBase[]) {
  const ariaModule = `aria-${target}`
  const isTargetExist = await exist(`./node_modules/${ariaModule}`)

  if (!isTargetExist) {
    throw new Error(`Module ${ariaModule} not Found.`)
  }

  if (isTargetExist) {
    const build = await import(`aria-${target}`).then(c => c.build)
    await build(config)
  }
}