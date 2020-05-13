import * as sinon from 'sinon'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { DEFAULT_VALUES } from '../common/common'
import { onwarn, createRollupConfig } from './base-config'
import { RollupConfigBase, RollupConfigOutput } from './common'

describe('base-config', () => {
  let libs: typeof import('../libs')
  let common: typeof import('../common/common')

  before(async() => {
    [ libs, common ] = await Promise.all([ 
      import('../libs'),
      import('../common/common')
    ])
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

    sinon.stub(common, 'getPackageNameSync').returns('custom-name')

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
      .stub(common, 'getPackageNameSync')
      .returns('custom-name')

    const { inputOptions } = createRollupConfig({ config })

    expect((inputOptions.plugins as any[]).length).equal(1)
    expect(pkgNameStub.called).toBeTrue()
  })

  it('should create base config witn replace,compress,external,sourcemap,watch options', () => {
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
      compress: true,
      watch: {
        clearScreen: true
      }
    }
    
    const pkgNameStub = sinon
      .stub(common, 'getPackageNameSync')
      .returns('custom-name')

    const terserStub = sinon.stub(libs, 'terser').returns(null)

    const { inputOptions, outputOptions } = createRollupConfig({ config })
    
    const { input, external, plugins } = inputOptions
    const { file, sourcemap } = outputOptions

    
    expect(input).equal(config.input)
    expect((plugins as any[]).length).equal(3)
    expect(path.normalize(file)).equal(path.normalize((config.output as RollupConfigOutput).file))
    expect(sourcemap).equal((config.output as RollupConfigOutput).sourcemap)
    expect(external.length).equal(DEFAULT_VALUES.ROLLUP_EXTERNALS.length)

    expect(pkgNameStub.called).toBeTrue()
    expect(terserStub.called).toBeTrue()
  })

})