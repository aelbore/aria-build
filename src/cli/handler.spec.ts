import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'
import { expect } from 'aria-mocha'

import { handler, bundlerOptions } from './handler'
import { BuildOptions, AriaConfigOptions } from './common'
import { PackageFile } from '../common/common'

describe('handler', () => {
  let ariaConfig: typeof import('./get-aria-config')
  let cliUtils: typeof import('./utils')
  let utils: typeof import('../utils/utils')
  let fs: typeof import('../fs/fs')
  let buildConfig: typeof import('./build-config')
  let esbuild: typeof import('../esbuild/esbuild')

  function createStubs() {
    const mergeGlobalsStub = sinon.spy(cliUtils, 'mergeGlobals')
    const parsePluginsStub = sinon.spy(cliUtils, 'parsePlugins')
    const fsCleanStub = sinon.stub(fs, 'clean').returns(void 0)

    const findTargetBuildStub = sinon.stub(utils, 'findTargetBuild')
      .returns(Promise.resolve(void 0))

    const buildConfigStub = sinon.stub(buildConfig, 'buildConfig').returns({})

    const parseConfigStub = sinon.spy(cliUtils, 'parseConfig')
    const mergeExternalStub = sinon.spy(cliUtils, 'mergeExternal')
    const esbundleStub = sinon.stub(esbuild, 'bundle').returns(Promise.resolve(void 0))

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
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      esbundleStub,
      mergeExternalStub
    }
  }

  before(async() => {
    [ ariaConfig, cliUtils, utils, fs, buildConfig, esbuild ] 
      = await Promise.all([
          import('./get-aria-config'),
          import('./utils'),
          import('../utils/utils'),
          import('../fs/fs'),
          import('./build-config'),
          import('../esbuild/esbuild')
      ])
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should build with handler with default options enabled esbuild', async () => {
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

    const { 
      mergeGlobalsStub,
      parsePluginsStub,
      fsCleanStub,
      buildConfigStub,
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      esbundleStub,
      mergeExternalStub
     } = createStubs()

    await handler(options)

    expect(getAriaConfigStub.called).toBeTrue()
    expect(parseConfigStub.called).toBeTrue()
    expect(getPackage.called).toBeTrue()
    expect(mergeGlobalsStub.called).toBeTrue()
    expect(parsePluginsStub.called).toBeTrue()
    expect(fsCleanStub.called).toBeTrue()
    expect(buildConfigStub.called).toBeTrue()
    expect(findTargetBuildStub.called).toBeFalse()
    expect(esbundleStub.called).toBeTrue()
    expect(mergeExternalStub.called).toBeTrue()
  })

  it('should build with handler when aria.config is null enable swc', async () => {
    const options: BuildOptions = {
      format: 'es,cjs,umd',
      declaration: false,
      output: 'dist',
      watch: false,
      swc: true
    }

    const getAriaConfigStub = sinon
      .stub(ariaConfig, 'getAriaConfig')
      .returns(Promise.resolve(null))
      
    const { 
      mergeGlobalsStub,
      parsePluginsStub,
      fsCleanStub,
      buildConfigStub,
      parseConfigStub,
      getPackage,
      findTargetBuildStub,
      mergeExternalStub
    } = createStubs()

    await handler(options)

    expect(getAriaConfigStub.called).toBeTrue()
    expect(parseConfigStub.called).toBeTrue()
    expect(getPackage.called).toBeTrue()
    expect(mergeGlobalsStub.called).toBeTrue()
    expect(parsePluginsStub.called).toBeTrue()
    expect(fsCleanStub.called).toBeFalse()
    expect(buildConfigStub.called).toBeTrue()
    expect(findTargetBuildStub.called).toBeFalse()
    expect(mergeExternalStub.called).toBeTrue()
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
      
    const { findTargetBuildStub } = createStubs()

    await handler(options)

    expect(findTargetBuildStub.called).toBeTrue()
  })

  it('should build dts only', async () => {
    const options: BuildOptions = {
      format: 'es,cjs,umd',
      declaration: false,
      output: 'dist',
      watch: false,
      /// @ts-ignore
      'dts-only': true
    }

    const getAriaConfigStub = sinon
      .stub(ariaConfig, 'getAriaConfig')
      .returns(Promise.resolve(null))
      
    const { esbundleStub } = createStubs()

    await handler(options)

    expect(esbundleStub.called).toBeTrue()
  })

  it('should have swc,esbuild flag', () => {
    ;(() => {
      const { esbuild, swc } = bundlerOptions()
      expect(esbuild).toBeTrue()
      expect(swc).toBeFalse()
    })()

    ;(() => {
      const { esbuild, swc } = bundlerOptions({ esbuild: true })
      expect(esbuild).toBeTrue()
      expect(swc).toBeFalse()
    })()

    ;(() => {
      const { esbuild, swc } = bundlerOptions({ esbuild: false })
      expect(esbuild).toBeFalse()
      expect(swc).toBeTrue()
    })()

    ;(() => {
      const { esbuild, swc } = bundlerOptions({ swc: true })
      expect(esbuild).toBeFalse()
      expect(swc).toBeTrue()
    })()

    ;(() => {
      const { esbuild, swc } = bundlerOptions({ swc: true, esbuild: true })
      expect(esbuild).toBeTrue()
      expect(swc).toBeFalse()
    })()

    ;(() => {
      const { esbuild, swc } = bundlerOptions({ swc: false, esbuild: true })
      expect(esbuild).toBeTrue()
      expect(swc).toBeFalse()
    })()
  })

})