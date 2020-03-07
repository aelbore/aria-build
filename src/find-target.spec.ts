import * as mockfs from 'mock-fs'
import * as mock from 'mock-require'

import { findTargetBuild } from './find-target'
import { expect } from 'aria-mocha'
import { RollupConfigBase } from './base-rollup-config'
import { TSRollupConfig } from './ts-rollup-config'

describe('find-target', () => {

  afterEach(() => {
    mock.stopAll()
    mockfs.restore()
  })

  it('should [findTargetBuild] and build from target module', async () => {
    let called = false
    mockfs({
      './node_modules/aria-vue': {}
    })

    const ariaVue = {
      build(config: RollupConfigBase[] | TSRollupConfig[]) { 
        called = true
      }
    }

    mock('aria-vue', ariaVue)

    await findTargetBuild('vue', [])

    expect(called).toBeTrue()
  })

  it('should throw an exception error when module not found', async () => {
    mockfs({
      './node_modules': {}
    })
    const ariaVue = {
      build(config: RollupConfigBase[] | TSRollupConfig[]) {  }
    }

    mock('aria-vue', ariaVue)

    try { 
      await findTargetBuild('vue', [])
    } catch(e) {
      expect(e.message).equal('Module aria-vue not Found.')
    }
  })

})