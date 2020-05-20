import { RollupConfigBase, TSRollupConfig } from '../common/common'

export async function findTargetBuild(target: string, 
  config: RollupConfigBase[] | TSRollupConfig[]
): Promise<void> {
  const mod = `aria-${target}`
  try {
    const aria = await import(mod)
    await aria.build(config)
  } catch (e) {
    return Promise.reject({
			code: e.code,
			message: `${mod} not found. npm install ${mod} or yarn add ${mod}`
		})
  }
}