import * as path from 'path'
import * as sinon from 'sinon'

import { expect } from 'aria-mocha'

import { baseDir, getInputEntryFile } from './common'

describe('common', () => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.restore()
    sinon.restore()
  })

  it('should get the baseDir', () => {
    const result = baseDir()
    expect(result).equal(path.resolve())
  })

  it('should get the baseDir when has process.env.APP_ROOT_PATH', () => {
    const expected = path.resolve('./build')

    sandbox
      .stub(process, 'env')
      .value({ 'APP_ROOT_PATH': expected })

    const result = baseDir()
    expect(result).equal(expected)
  })

  it('should getInputEntryFile', () => {
    const result = getInputEntryFile('./src/input.ts')
    expect(result).equal('input')
  })

})