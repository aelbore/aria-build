import { join } from 'path'
import { existsSync } from 'fs'
import { baseDir } from '../common/common'

import { AriaConfigOptions } from './common'

export async function getAriaConfig(config?: string): Promise<AriaConfigOptions> { 
  const ROLLUP_CONFIG_PATH = join(baseDir(), config ?? 'aria.config.ts')
  if (existsSync(ROLLUP_CONFIG_PATH)) {
    const ariaConfig = await import(ROLLUP_CONFIG_PATH).then(c => c.default)
    return ariaConfig
  }
  return null
}