import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'
import * as mock from 'mock-require'

import { expect } from 'aria-mocha'

import { RollupConfigBase, TSRollupConfig } from '../common/common'
import { findTargetBuild } from './find-target'

describe('find-target', () => {

  afterEach(() => {
    mockfs.restore()
    mock.stopAll()
    sinon.restore()
  })

  it('should findTargetBuild when module exist', async () => {
    const ariVue = {
      async build(config: RollupConfigBase[] | TSRollupConfig[]) { 
        await Promise.resolve()
      }
    }

    const build = sinon.spy(ariVue, 'build')
    mock('aria-vue', ariVue)

    await findTargetBuild('vue', [])

    expect(build.called).toBeTrue()
  })
  
  it('should throw an error module not found', async () => {
    mockfs({
      './node_modules': {}
    })

    try {
      await findTargetBuild('vue', [])
    } catch(e) {
      expect(e.message)
        .toThrow('aria-vue not found. npm install aria-vue or yarn add aria-vue')
    }
  })

})