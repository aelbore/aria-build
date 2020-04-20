import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'
import { expect } from 'aria-mocha'

import { handler } from './handler'
import { BuildOptions, AriaConfigOptions } from './common'
import { PackageFile } from '../utils/utils'

describe('handler', () => {
  let ariaConfig: typeof import('./get-aria-config')
  let cliUtils: typeof import('./utils')
  let utils: typeof import('../utils/utils')
  let fs: typeof import('../fs/fs')
  let buildES: typeof import('./build-es')
  let buildCJS: typeof import('./build-cjs')
  let buildUmd: typeof import('./build-umd')
  let build: typeof import('../build/index')

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
    const renameDtsEntryFileStub = sinon.stub(utils, 'renameDtsEntryFile')
      .returns(Promise.resolve(void 0))
    const moveDtsFilesStub = sinon.stub(utils, 'moveDtsFiles')
      .returns(Promise.resolve(void 0))

    const buildesStub = sinon.stub(buildES, 'buildES').returns({})
    const buildcjsStub = sinon.stub(buildCJS, 'buildCommonJS').returns({})
    const buildUmdStub = sinon.stub(buildUmd, 'buildUmd').returns({})
    const buildStub = sinon.stub(build, '_build').returns(void 0)

    const parseConfigStub = sinon.spy(cliUtils, 'parseConfig')

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
      buildesStub,
      buildcjsStub,
      buildUmdStub,
      buildStub,
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      copyPackageFileStub,
      copyReadMeFileStub,
      renameDtsEntryFileStub,
      moveDtsFilesStub
    }
  }

  before(async() => {
    [ ariaConfig, cliUtils, utils, fs, buildES, buildCJS, buildUmd, build ] 
      = await Promise.all([
          import('./get-aria-config'),
          import('./utils'),
          import('../utils/utils'),
          import('../fs/fs'),
          import('./build-es'),
          import('./build-cjs'),
          import('./build-umd'),
          import('../build/index')
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
      buildesStub,
      buildcjsStub,
      buildUmdStub,
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
    expect(fsCleanStub.called).toBeTrue()
    expect(buildesStub.called).toBeTrue()
    expect(buildcjsStub.called).toBeTrue()
    expect(buildUmdStub.called).toBeFalse()
    expect(buildStub.called).toBeTrue()
    expect(findTargetBuildStub.called).toBeFalse()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(renameDtsEntryFileStub.called).toBeTrue()
    expect(moveDtsFilesStub.called).toBeTrue()
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
      buildesStub,
      buildcjsStub,
      buildUmdStub,
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
    expect(buildesStub.called).toBeTrue()
    expect(buildcjsStub.called).toBeTrue()
    expect(buildUmdStub.called).toBeTrue()
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