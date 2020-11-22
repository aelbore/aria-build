import * as sinon from 'sinon'
import * as mock from 'mock-require'
import * as mockfs from 'mock-fs'

import { esbuildDts } from './build-dts'
import { CreateRollupConfigOptions } from '../common/common'
import { expect } from 'aria-mocha'
import { CreateRollupConfigBuilderOptions } from './bundle'

describe('esbuild [build]', () => {
  let libs: typeof import('../libs')
  let getPkgName: typeof import('../utils/get-package')

  function createStubs() {
    const rollup = {
      generate(outputOptions: import('rollup').OutputOptions)
        : Promise<import('rollup').RollupOutput> {
        return Promise.resolve({} as import('rollup').RollupOutput)
      },
      watchFiles: [],
      cache: null,
      write(options: import('rollup').OutputOptions) {
        return Promise.resolve({} as Promise<import('rollup').RollupOutput>)
      }
    }

    const rollupStub = sinon
      .stub(libs, 'rollup')
      .returns(Promise.resolve(rollup))

    const rollupWriteStub = sinon
      .stub(rollup, 'write')
      .returns(Promise.resolve({} as Promise<import('rollup').RollupOutput>))

    const rollupGeneratetub = sinon
      .stub(rollup, 'generate')
      .returns(Promise.resolve({} as Promise<import('rollup').RollupOutput>))

    const getPkgNameStub = sinon
      .stub(getPkgName, 'getPackageName')
      .returns(Promise.resolve('aria-build'))

    const dts = { default() { } }
    mock('rollup-plugin-dts', dts)

    const nodeResolve = { default() { } }
    mock('@rollup/plugin-node-resolve', nodeResolve)

    const dtsSpy = sinon.spy(dts, 'default')
    const nodeResolveSpy = sinon.spy(nodeResolve, 'default')

    return { rollupGeneratetub, nodeResolveSpy, rollupStub, rollupWriteStub, getPkgNameStub, dtsSpy }
  }

  before(async () => {
    [ libs, getPkgName ] = await Promise.all([ 
      import('../libs'), 
      import('../utils/get-package') 
    ])
  })

  afterEach(() => {
    sinon.restore()
    mock.stopAll()
    mockfs.restore()
  })

  it('should create dts file', async() => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        output: {
          file: './dist/output.d.ts'
        },
        tsconfig: {
          compilerOptions: {
            declaration: true
          }
        }
      },
      write: true,
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { rollupStub, rollupWriteStub, dtsSpy, getPkgNameStub } = createStubs()

    await esbuildDts(options)

    expect(rollupStub.called).toBeTrue()
    expect(rollupWriteStub.called).toBeTrue()
    expect(getPkgNameStub.called).toBeFalse()
    expect(dtsSpy.called).toBeTrue()
  })

  it('should create dts file when config is typeof array and output,external write option disabled', async() => {
    const options: CreateRollupConfigOptions = {
      config: [
        {
          input: './src/input.ts',
          external: [ 'fs' ],
          output: [ 
            {
              file: './dist/output.ts'
            }
          ],
          tsconfig: {
            compilerOptions: {
              declaration: true
            }
          }
        }
      ],
      esbuild: true
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { rollupStub, rollupGeneratetub, rollupWriteStub, getPkgNameStub, dtsSpy } = createStubs()

    await esbuildDts(options)

    expect(rollupStub.called).toBeTrue()
    expect(rollupWriteStub.called).toBeFalse()
    expect(rollupGeneratetub.called).toBeTrue()
    expect(getPkgNameStub.called).toBeTrue()
    expect(dtsSpy.called).toBeTrue()
  })

  it('should not create dts file without tsconfig', async() => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        output: {
          file: './dist/output.d.ts'
        }
      },
      write: true,
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { rollupStub, rollupWriteStub, dtsSpy, getPkgNameStub } = createStubs()

    await esbuildDts(options)

    expect(rollupStub.called).toBeFalse()
    expect(rollupWriteStub.called).toBeFalse()
    expect(getPkgNameStub.called).toBeFalse()
    expect(dtsSpy.called).toBeFalse()
  })

  it('should execute additional plugins when it is dtsOnly', async () => {
    const copy = () => ({
      name: 'copy',
      buildEnd() { }
    })
    
    const options: CreateRollupConfigBuilderOptions = {
      config: {
        input: './src/input.ts',
        plugins: [
          copy()
        ],
        output: {
          file: './dist/output.d.ts'
        },
        tsconfig: {
          compilerOptions: {
            declaration: true
          }
        }
      },
      write: true,
      esbuild: true,
      name: 'aria-build',
      dtsOnly: true
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { dtsSpy } = createStubs()

    await esbuildDts(options)

    expect(dtsSpy.called).toBeTrue()
  })

})