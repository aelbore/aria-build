import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'

import { TSRollupConfig, ConfigResult } from '../config/config'
import { hmrBuild } from './hmr-build'

describe('hrmBuild', () => {
  let libs: typeof import('../libs')
  let config: typeof import('../config/config')
  
  before(async () => {
    [ libs, config ] = await Promise.all([  import('../libs'), import('../config/config') ])
  })

  afterEach(() => {
    sinon.restore()
    mockfs.restore()
  })

  it('should build and watch with config', async () => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })

    const name = 'aria-hmr'

    const configOptions: TSRollupConfig = {
      input: './src/index.js',
      external: [ 'fs' ],
      plugins: [],
      output: {
        file: 'public/bundle.js',
        sourcemap: true,
        format: 'es'
      }
    }

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

    await hmrBuild({ config: configOptions, name })

    expect(watchStub.called).toBeTrue()
    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(hmrPluginStub.called).toBeTrue()
  })

})