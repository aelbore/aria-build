import * as path from 'path'
import * as mock from 'mock-require'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { getAriaConfig } from './get-aria-config'

describe('getAriaConfig', () => {

  afterEach(() => {
    mockfs.restore()
    mock.stopAll()
  })

  it('should getAriaConfig', async () => {
    mock(path.resolve('aria.config.ts'), { default: {} })

    const config = await getAriaConfig()
    
    expect(config).toBeDefined()
  })

  it('should getAriaConfig with config params', async () => {
    mock(path.resolve('aria.config.ts'), { default: {} })

    const config = await getAriaConfig('./aria.config.ts')
    
    expect(config).toBeDefined()
  })

  it('should not getAriaConfig when air.config.ts is not exist ', async () => {
    mockfs({
      'dist': {}
    })
    const config = await getAriaConfig('./aria.config.ts')
    
    expect(config).equal(null)
  })


})