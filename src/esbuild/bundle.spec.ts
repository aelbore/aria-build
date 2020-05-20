import * as sinon from 'sinon'
import * as mock from 'mock-require'
import * as mockfs from 'mock-fs'

import { TSRollupConfig } from '../common/common'
import { expect } from 'aria-mocha'
import { esbundle } from './bundle'
import { BuildFormatOptions } from '../cli/cli'

describe('esbuild [bundle]', () => {
  let build: typeof import('./build')
  let dts: typeof import('./build-dts')
  let utils: typeof import('../utils/utils')
  let buildConfig: typeof import('../cli/build-config')
  let fs: typeof import('../fs/fs')

  function createStubs() {
    const buildConfigStub = sinon.stub(buildConfig, 'buildConfig')
      .returns({} as TSRollupConfig)

    const buildStub = sinon.stub(build, 'esbuild')
      .returns(Promise.resolve([[]] as import('rollup').RollupOutput[][]))

    const dtsStub = sinon.stub(dts, 'esbuildDts')
      .returns(Promise.resolve([] as import('rollup').RollupOutput[]))

    const copyPackageFileStub = sinon.stub(utils, 'copyPackageFile')
      .returns(Promise.resolve(void 0))
    
    const copyReadMeFileStub = sinon.stub(utils, 'copyReadMeFile')
        .returns(Promise.resolve(void 0))

    const getPackageStub = sinon.stub(utils, 'getPackage')
      .returns({} as any)

    const mkdirStub = sinon.stub(fs, 'mkdir')
      .returns(Promise.resolve(''))

    return { mkdirStub, getPackageStub, buildConfigStub, buildStub, dtsStub, copyPackageFileStub, copyReadMeFileStub }
  }

  before(async() => {
    [ buildConfig, dts, utils, build, fs ] = await Promise.all([
      import('../cli/build-config'),
      import('./build-dts'),
      import('../utils/utils'),
      import('./build'),
      import('../fs/fs')
    ])
  })

  afterEach(() => {
    sinon.restore()
    mock.stopAll()
    mockfs.restore()
  })

  it('should bundle with rollup config options and package.json', async () => {
    const options = {
      config: {
        input: './src/input.ts',
        output: {
          file: './dist/output.d.ts'
        }
      },
      esbuild: true,
      name: 'aria-build',
      pkg: { }
    }

    const { getPackageStub } = createStubs()

    await esbundle(options)
    expect(getPackageStub.called).toBeFalse()
  })

  it('should bundle with rollup config options', async () => {
    const options: CreateRollupConfigOptionsEsbuild = {
      config: {
        input: './src/input.ts',
        output: {
          file: './dist/output.d.ts'
        }
      },
      esbuild: true,
      name: 'aria-build'
    }

    const { 
      buildConfigStub, 
      buildStub, 
      dtsStub, 
      copyPackageFileStub, 
      copyReadMeFileStub 
    } = createStubs()

    await esbundle(options)
    
    expect(buildConfigStub.called).toBeFalse()
    expect(buildStub.called).toBeTrue()
    expect(dtsStub.called).toBeTrue()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
  })

  it('should bundle with buildOptions', async () => {
    const options: BuildFormatOptions = {
      format: 'es,cjs',
      output: 'dist',
      pkgName: 'aria-build',
      declaration: true,
      config: './'
    }

    const { 
      buildConfigStub, 
      buildStub, 
      dtsStub, 
      copyPackageFileStub, 
      copyReadMeFileStub,
      getPackageStub
    } = createStubs()

    await esbundle(options)
    
    expect(buildConfigStub.called).toBeTrue()
    expect(buildStub.called).toBeTrue()
    expect(dtsStub.called).toBeTrue()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(getPackageStub.called).toBeTrue()
  })
  
})