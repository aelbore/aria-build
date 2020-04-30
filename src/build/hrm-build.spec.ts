import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'

import { TSRollupConfig, ConfigResult } from '../config/config'
import { hmrBuild } from './hmr-build'

describe('hrmBuild', () => {
  let libs: typeof import('../libs')
  let config: typeof import('../config/config')

  function createStubs(configOptions: TSRollupConfig) {
    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: [],
      },
      outputOptions: {
        ...configOptions.output
      }
    }

    const createTSRollupConfigStub = sinon
      .stub(config, '_createTSRollupConfig')
      .returns(options as ConfigResult)

    const watchStub = sinon.stub(libs, 'watch').returns(void 0)
    const hmrPluginStub = sinon.stub(libs, 'hmrPlugin').returns(void 0)

    return { createTSRollupConfigStub, watchStub, hmrPluginStub }
  }

  function createConfigOptions(opts?: TSRollupConfig) {
    const configOptions: TSRollupConfig = {
      input: './src/index.js',
      external: [ 'fs' ],
      plugins: [],
      output: {
        file: 'public/bundle.js',
        sourcemap: true,
        format: 'es'
      },
      ...(opts ?? {})
    }
    return configOptions
  }
  
  before(async () => {
    [ libs, config ] = await Promise.all([  import('../libs'), import('../config/config') ])
  })

  beforeEach(() => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })
  })

  afterEach(() => {
    sinon.restore()
    mockfs.restore()
  })

  it('should build and watch with config hmr disabled', async () => {
    const name = 'aria-hmr'

    const configOptions = createConfigOptions()
    const { watchStub, createTSRollupConfigStub, hmrPluginStub } = createStubs(configOptions)

    await hmrBuild({ config: configOptions, name })

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(watchStub.called).toBeFalse()
    expect(hmrPluginStub.called).toBeFalse()
  })

  it('should build and watch with config hmr enable', async () => {
    const name = 'aria-hmr'

    const configOptions = createConfigOptions({ hmr: true })
    const { watchStub, createTSRollupConfigStub, hmrPluginStub } = createStubs(configOptions)

    await hmrBuild({ config: configOptions, name })

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(watchStub.called).toBeTrue()
    expect(hmrPluginStub.called).toBeTrue()
  })

})