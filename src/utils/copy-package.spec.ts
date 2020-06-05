import * as path from 'path'
import * as fs from 'fs'
import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'

import { expect } from 'aria-mocha'
import { copyPackageFile } from './copy-package'

describe('copy-package', () => {
  let getPackage: typeof import('./get-package')
  
  before(async () => {
    getPackage = await import('./get-package')
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should copy package.json to default outDir', async () => {
    const pkg = {
      name: 'copy-package'
    }

    mockfs({
      'dist': {}
    })

    sinon
      .stub(getPackage, 'getPackage')
      .returns(Promise.resolve(pkg))

    await copyPackageFile()
    expect(fs.existsSync('./dist/package.json')).toBeTrue()    
  })

  it('should copy package.json to default outDir when have filePath and format', async () => {
    const pkg = {
      name: 'custom-package',
      main: './cjs/custom-package.js',
      typings: 'custom-package.d.ts',
      module: 'custom-package.es.js'
    }

    const options = {
      ...pkg,
      filePath: './build/package.json',
      format: 'cjs'
    }
    
    mockfs({
      'build': {
        'package.json': JSON.stringify(pkg)
      },
      'dist': {}
    })

    await copyPackageFile(options)

    const outfilePath = path.resolve('./dist/package.json')
    expect(fs.existsSync(outfilePath)).toBeTrue()  

    const json = JSON.parse(await fs.promises.readFile(outfilePath, 'utf-8'))
    expect(json.name).equal(pkg.name)
    expect(json.main).equal(pkg.main)
    expect(json.typings).equal(pkg.typings)
    expect(json.module).equal(pkg.module)
  }) 

  it('should copy package.json to default outDir when options is empty', async () => {
    const pkg = {
      name: 'custom-package'
    }

    const options = {}
    
    mockfs({
      'dist': {}
    })

    sinon
      .stub(getPackage, 'getPackage')
      .returns(Promise.resolve(pkg))

    await copyPackageFile({})

    const outfilePath = path.resolve('./dist/package.json')
    expect(fs.existsSync(outfilePath)).toBeTrue()  

    const json = JSON.parse(await fs.promises.readFile(outfilePath, 'utf-8'))
    expect(json.name).equal(pkg.name)
    expect(json.main).equal(`${pkg.name}.js`)
    expect(json.typings).equal(`${pkg.name}.d.ts`)
  })

  it('should copy package.json to outDir, has entry,output,format(multiple) options', async () => {
    const pkg = {
      name: 'custom-package'
    }

    const options = {
      entry: './src/input.ts',
      output: 'dist',
      format: 'es,umd'
    }

    mockfs({
      'dist': {}
    })

    sinon
    .stub(getPackage, 'getPackage')
    .returns(Promise.resolve(pkg))

    await copyPackageFile(options)
    expect(fs.existsSync('./dist/package.json')).toBeTrue()
  })
  
})