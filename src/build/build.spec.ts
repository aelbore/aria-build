import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'
import * as fs from 'fs'

import { expect } from 'aria-mocha'
import { TSRollupConfig, ConfigResult } from '../config/config'

import { build, _build, __build } from './build'

describe('build', () => {
  let config: typeof import('../config/config')

  before(async() => {
    config = await import('../config/config')
  })

  beforeEach(() => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should build with config', async () => {
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

    await build({ input: './src/input.ts' })

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  })  

  it('should build with config array', async () => {
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
        input: './src/input.ts'
      } 
    ]

    await build(configOptions)

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  })  

  it('should _build with config', async () => {
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
      .stub(config, '_createTSRollupConfig')
      .returns(options as ConfigResult)

    const configOptions = {
      input: './src/input.ts'
    }

    await _build({ config: configOptions, name: 'aria-test' })

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  }) 

  it('should __build with config', async () => {
    const options = [
      {
        inputOptions: { input: './src/input.ts', external: [ 'fs' ] },
        outputOptions: { file: './dist/input.js', format: 'es' }
      }
    ]

    const createTSRollupConfigStub = sinon
      .stub(config, 'createTSRollupConfigs')
      .returns(options as ConfigResult[])

    const configOptions = {
      input: './src/input.ts'
    }

    await __build({ config: configOptions, name: 'aria-test' })

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  }) 

})