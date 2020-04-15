import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'
import * as fs from 'fs'

import { expect } from 'aria-mocha'
import { TSRollupConfig, ConfigResult } from '../config/config'

import { build } from './build'

describe('build', () => {
  let config: typeof import('../config/config')

  before(async() => {
    config = await import('../config/config')
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should build with config', async () => {
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

    const configOptions: TSRollupConfig = {
      input: './src/input.ts',
      external: [ 'fs' ],
      output: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    await build(configOptions)

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  })  

  it('should build with config array', async () => {
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

    await build(configOptions)

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  })  

})