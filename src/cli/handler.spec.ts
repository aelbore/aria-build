import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'
import { expect } from 'aria-mocha'

import { handler } from './handler'
import { BuildOptions, AriaConfigOptions } from './common'
import { PackageFile } from '../common/common'

describe('handler', () => {
  let ariaConfig: typeof import('./get-aria-config')
  let cliUtils: typeof import('./utils')
  let utils: typeof import('../utils/utils')
  let fs: typeof import('../fs/fs')
  let buildConfig: typeof import('./build-config')
  let build: typeof import('../build/build')
  let esbuild: typeof import('../esbuild/esbuild')

  function createStubs() {
    const mergeGlobalsStub = sinon.spy(cliUtils, 'mergeGlobals')
    const parsePluginsStub = sinon.spy(cliUtils, 'parsePlugins')
    const fsCleanStub = sinon.stub(fs, 'clean').returns(void 0)

    const findTargetBuildStub = sinon.stub(utils, 'findTargetBuild')
      .returns(Promise.resolve(void 0))
    const copyPackageFileStub = sinon.stub(utils, 'copyPackageFile')
      .returns(Promise.resolve(void 0))
    const copyReadMeFileStub = sinon.stub(utils, 'copyReadMeFile')
      .returns(Promise.resolve(void 0))
    const renameDtsEntryFileStub = sinon.stub(utils, 'erenameDtsEntryFile')
      .returns(Promise.resolve(void 0))
    const moveDtsFilesStub = sinon.stub(utils, 'moveDtsFiles')
      .returns(Promise.resolve(void 0))

    const buildConfigStub = sinon.stub(buildConfig, 'buildConfig').returns({})
    const buildStub = sinon.stub(build, 'ebuild').returns(void 0)

    const parseConfigStub = sinon.spy(cliUtils, 'parseConfig')

    const esbundleStub = sinon.stub(esbuild, 'esbundle')
      .returns(Promise.resolve(void 0))

    const pkg: PackageFile = {
      name: 'aria-test',
      dependencies: {
        'vue': '2.0.1'
      }
    }
    const getPackage = sinon
      .stub(utils, 'getPackage')
      .returns(Promise.resolve(pkg))

    return { 
      mergeGlobalsStub,
      parsePluginsStub,
      fsCleanStub,
      buildConfigStub,
      buildStub,
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      copyPackageFileStub,
      copyReadMeFileStub,
      renameDtsEntryFileStub,
      moveDtsFilesStub,
      esbundleStub
    }
  }

  before(async() => {
    [ ariaConfig, cliUtils, utils, fs, build, buildConfig, esbuild ] 
      = await Promise.all([
          import('./get-aria-config'),
          import('./utils'),
          import('../utils/utils'),
          import('../fs/fs'),
          import('../build/index'),
          import('./build-config'),
          import('../esbuild/esbuild')
      ])
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should build with handler with default options', async () => {
    const options: BuildOptions = {
      format: 'es,cjs',
      declaration: false,
      output: 'dist',
      watch: false,
      clean: 'dist'
    }

    const config: AriaConfigOptions = { 
      output: {
        globals: {}
      }
    }
    const getAriaConfigStub = sinon
      .stub(ariaConfig, 'getAriaConfig')
      .returns(Promise.resolve(config))

    const { 
      mergeGlobalsStub,
      parsePluginsStub,
      fsCleanStub,
      buildConfigStub,
      buildStub,
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      copyPackageFileStub,
      copyReadMeFileStub,
      renameDtsEntryFileStub,
      moveDtsFilesStub,
      esbundleStub
     } = createStubs()

    await handler(options)

    expect(getAriaConfigStub.called).toBeTrue()
    expect(parseConfigStub.called).toBeTrue()
    expect(getPackage.called).toBeTrue()
    expect(mergeGlobalsStub.called).toBeTrue()
    expect(parsePluginsStub.called).toBeTrue()
    expect(fsCleanStub.called).toBeTrue()
    expect(buildConfigStub.called).toBeTrue()
    expect(buildStub.called).toBeTrue()
    expect(findTargetBuildStub.called).toBeFalse()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(renameDtsEntryFileStub.called).toBeTrue()
    expect(moveDtsFilesStub.called).toBeTrue()
    expect(esbundleStub.called).toBeFalse()
  })

  it('should build with handler with esbuild enabled', async () => {
    const options: BuildOptions = {
      format: 'es,cjs',
      declaration: false,
      output: 'dist',
      watch: false,
      clean: 'dist',
      esbuild: true
    }

    const config: AriaConfigOptions = { 
      output: {
        globals: {}
      }
    }
    const getAriaConfigStub = sinon
      .stub(ariaConfig, 'getAriaConfig')
      .returns(Promise.resolve(config))

    const { buildStub, esbundleStub } = createStubs()

    await handler(options)

    expect(buildStub.called).toBeFalse()
    expect(esbundleStub.called).toBeTrue()
  })

  it('should build with handler when aria.config is null', async () => {
    const options: BuildOptions = {
      format: 'es,cjs,umd',
      declaration: false,
      output: 'dist',
      watch: false
    }

    const getAriaConfigStub = sinon
      .stub(ariaConfig, 'getAriaConfig')
      .returns(Promise.resolve(null))
      
    const { 
      mergeGlobalsStub,
      parsePluginsStub,
      fsCleanStub,
      buildConfigStub,
      buildStub,
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      copyPackageFileStub,
      copyReadMeFileStub,
      renameDtsEntryFileStub,
      moveDtsFilesStub
    } = createStubs()

    await handler(options)

    expect(getAriaConfigStub.called).toBeTrue()
    expect(parseConfigStub.called).toBeTrue()
    expect(getPackage.called).toBeTrue()
    expect(mergeGlobalsStub.called).toBeTrue()
    expect(parsePluginsStub.called).toBeTrue()
    expect(fsCleanStub.called).toBeFalse()
    expect(buildConfigStub.called).toBeTrue()
    expect(buildStub.called).toBeTrue()
    expect(findTargetBuildStub.called).toBeFalse()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(renameDtsEntryFileStub.called).toBeTrue()
    expect(moveDtsFilesStub.called).toBeTrue()
  })

  it('should build with handler when options have target', async () => {
    const options: BuildOptions = {
      format: 'es,cjs,umd',
      declaration: false,
      output: 'dist',
      watch: false,
      target: 'vue'
    }

    const getAriaConfigStub = sinon
      .stub(ariaConfig, 'getAriaConfig')
      .returns(Promise.resolve(null))
      
    const { 
      findTargetBuildStub, 
      copyPackageFileStub,
      copyReadMeFileStub,
      renameDtsEntryFileStub,
      moveDtsFilesStub
    } = createStubs()

    await handler(options)

    expect(findTargetBuildStub.called).toBeTrue()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(renameDtsEntryFileStub.called).toBeTrue()
    expect(moveDtsFilesStub.called).toBeTrue()
  })

})