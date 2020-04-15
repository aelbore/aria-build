import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { TSRollupConfig, ConfigResult } from '../config/config'
import { buildOutput } from './build-output'

describe('buildOutput', () => {
  let config: typeof import('../config/config')
  let generate: typeof import('../build/generate')

  before(async() => {
    [ config, generate ] = await Promise.all([
      import('../config/config'),
      import('../build/generate')
    ])
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should buildOutput with config', async () => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })

    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ]
      },
      outputOptions: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    const createTSRollupConfigStub = sinon
      .stub(config, 'createTSRollupConfig')
      .returns(options as ConfigResult)

    const generateStub = sinon.spy(generate, 'rollupGenerate')

    const configOptions: TSRollupConfig = {
      input: './src/input.ts',
      external: [ 'fs' ],
      output: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    const outputs = await buildOutput(configOptions)

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(generateStub.called).toBeTrue()
  })

  it('should buildOutput with config array', async () => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })

    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ]
      },
      outputOptions: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    const createTSRollupConfigStub = sinon
      .stub(config, 'createTSRollupConfig')
      .returns(options as ConfigResult)

    const generateStub = sinon.spy(generate, 'rollupGenerate')

    const configOptions: TSRollupConfig[] = [ 
      {
        input: './src/input.ts',
        external: [ 'fs' ],
        output: {
          file: './dist/input.js',
          format: 'es'
        }
      }
    ]

    const outputs = await buildOutput(configOptions)

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(generateStub.called).toBeTrue()
  })

})