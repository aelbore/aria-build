import * as sinon from 'sinon'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { DEFAULT_VALUES } from '../utils/utils'
import { onwarn, createRollupConfig, RollupConfigBase } from './base-config'

describe('base-config', () => {
  let utils: any, libs: any

  before(async() => {
    [ utils, libs ] = await Promise.all([ import('../utils/utils'), import('../libs') ])
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should have no warning message', () => {
    const logSpy = sinon.spy(console, 'log')

    onwarn({ code: 'THIS_IS_UNDEFINED', message: 'Message Here' })

    expect(logSpy.called).toBeFalse()
  })

  it('should have no warning message', () => {
    const logStub = sinon
      .stub(console, 'log')
      .returns(null)

    onwarn({ code: 'Error', message: 'Message Here' })

    expect(logStub.called).toBeTrue()
  })

  it('should create base config with input,output', async () => {

    const config: RollupConfigBase = {
      input: './src/input.ts',
      output: {
        file: './src/input.js'
      }
    }

    const utils = await import('../utils/utils')
    sinon.stub(utils, 'getPackageNameSync').returns('custom-name')

    createRollupConfig({ config })
  })

  it('should create base config with name', () => {

    const config: RollupConfigBase = {
      input: './src/input.ts'
    }

    createRollupConfig({ config, name: 'custom-name' })
  })

  it('should create base config with multiple input', async() => {
    const config: RollupConfigBase = {
      input: [ './src/input.ts', './src/fs.ts' ]
    }

    const pkgNameStub = sinon
      .stub(utils, 'getPackageNameSync')
      .returns('custom-name')

    const { inputOptions } = createRollupConfig({ config })

    expect((inputOptions.plugins as any[]).length).equal(1)
    expect(pkgNameStub.called).toBeTrue()
  })

  it('should create base config witn replace,compress,external,sourcemap options', () => {
    const fakePlugin = () => {}

    const config: RollupConfigBase = {
      input: './src/input.ts',
      plugins: [ fakePlugin() ],
      external: [],
      output: {
        sourcemap: true,
        file: './src/input.js'
      },
      replace: {
        'process.env.NODE_ENV': JSON.stringify('production')
      },
      compress: true
    }
    
    const pkgNameStub = sinon
      .stub(utils, 'getPackageNameSync')
      .returns('custom-name')

    const terserStub = sinon.stub(libs, 'terser').returns(null)

    const { inputOptions, outputOptions } = createRollupConfig({ config })
    
    const { input, external, plugins } = inputOptions
    const { file, sourcemap } = outputOptions

    expect(input).equal(config.input)
    expect((plugins as any[]).length).equal(3)
    expect(file).equal(path.resolve(config.output.file))
    expect(sourcemap).equal(config.output.sourcemap)
    expect(external.length).equal(DEFAULT_VALUES.ROLLUP_EXTERNALS.length)

    expect(pkgNameStub.called).toBeTrue()
    expect(terserStub.called).toBeTrue()
  })

})