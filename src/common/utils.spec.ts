import * as path from 'path'
import * as sinon from 'sinon'
import * as mock from 'mock-require'

import { expect } from 'aria-mocha'

import { baseDir, getInputEntryFile, getPackageNameSync, onwarn } from './common'

describe('common', () => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.restore()
    sinon.restore()
    mock.stopAll()
  })

  it('should have no warning message', () => {
    const logSpy = sinon.spy(console, 'log')

    onwarn({ code: 'THIS_IS_UNDEFINED', message: 'Message Here' })

    expect(logSpy.called).toBeFalse()
  })

  it('should have no warning message', () => {
    const logStub = sinon.stub(console, 'log').returns(null)

    onwarn({ code: 'Error', message: 'Message Here' })

    expect(logStub.called).toBeTrue()
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

  it('should get name in package.json [getPackageNameSync]', () => {
    const pkg = {
      name: 'aria-test'
    }
  
    mock(path.resolve('package.json'), pkg)

    const name = getPackageNameSync()
    expect(name).equal('aria-test')
  })

  it('should get name in package.json with filePath [getPackageNameSync]', () => {
    const filePath = path.resolve('./build/package.json')
    
    const pkg = {
      name: 'aria-test'
    }
  
    mock(filePath, pkg)

    const name = getPackageNameSync(filePath)
    expect(name).equal('aria-test')
  })

})