import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'
import * as fs from 'fs'
import * as mock from 'mock-require'

import { expect } from 'aria-mocha'
import { TSRollupConfig, ConfigResult } from '../config/config'

import { build, _build, ebuild } from './build'
import { Service, TransformResult, TransformOptions } from 'esbuild'

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
    mock.stopAll()
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

  it('should ebuild with config', async () => {
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

    await ebuild({ config: configOptions, name: 'aria-test' })

    expect(createTSRollupConfigStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  }) 

  it('should ebuild with config with esbuild', async () => {
    const options = [
      {
        inputOptions: { input: './src/input.ts', external: [ 'fs' ] },
        outputOptions: { file: './dist/input.js', format: 'es' }
      }
    ]

    const createRollupConfigsStub = sinon
      .stub(config, 'createRollupConfigs')
      .returns(options as ConfigResult[])

    const configOptions = {
      input: './src/input.ts'
    }

    const mockEsbuild = {
      startService(): Promise<Service> { 
        function stop(): void { }

        function transform(file: string, 
          options: TransformOptions): Promise<TransformResult> {
            const result: TransformResult = {
              warnings: []
            }
            return Promise.resolve(result)
        }

        const result: Service = { stop, transform }

        return Promise.resolve(result)
      }
    }

    mock('esbuild', mockEsbuild)
    
    await ebuild({ config: configOptions, name: 'aria-test', esbuild: true })

    expect(createRollupConfigsStub.called).toBeTrue()
    expect(fs.existsSync('./dist/input.js')).toBeTrue()
  }) 

})