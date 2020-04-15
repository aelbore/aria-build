import * as path from 'path'
import * as mock from 'mock-require'
import * as sinon from 'sinon'

import { expect } from 'aria-mocha'
import { getPackage, getPackageName, getPackageNameSync } from './get-package'

describe('get-package', () => {
  const sanbox = sinon.createSandbox()

  afterEach(() => {
    mock.stopAll()
    sinon.restore()
    sanbox.restore()
  })

  it(`should get values from package.json when filePath is empty and use the workspace directory`, async () => {
    const pkg = {
      name: 'aria-test'
    }
  
    mock(path.resolve('package.json'), pkg)

    const result = await getPackage()
    expect(result.name).equal('aria-test')
  })

  it(`should get values from package.json when filePath is empty and use the process.env.APP_ROOT_PATH directory`, async () => {
    const customPath = path.resolve(path.join('custom-package', 'package.json'))    
    const pkg = {
      name: 'custom-package'
    }

    sanbox
      .stub(process, 'env')  
      .value({ 'APP_ROOT_PATH': path.dirname(customPath) })

    mock(customPath, pkg)

    const result = await getPackage()
    expect(result.name).equal('custom-package')
  })

  it('should get values from package.json when has filePath', async () => {
    const filePath = path.resolve('./build/package.json')
    const pkg = {
      name: 'aria'
    }

    mock(filePath, pkg)

    const result = await getPackage(filePath)
    expect(result.name).equal('aria')
  })

  it('should get name in package.json', async () => {
    const pkg = {
      name: 'aria-test'
    }
  
    mock(path.resolve('package.json'), pkg)
    const name = await getPackageName()

    expect(name).equal('aria-test')
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