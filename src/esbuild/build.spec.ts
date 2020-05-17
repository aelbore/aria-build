import * as sinon from 'sinon'
import * as mock from 'mock-require'
import * as mockfs from 'mock-fs'

import { esbuild } from './build'
import { CreateRollupConfigOptions } from '../config/config'
import { expect } from 'aria-mocha'

describe('esbuild [esbuild]', () => {
  let libs: typeof import('../libs')

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

    const esBuildPluginStub = sinon
      .stub(libs, 'esBuildPlugin')
      .returns(void 0)

    const multiEntryCalled = {
      called() { }
    }
    const multiEntry = function() { 
      multiEntryCalled.called()
    } 
    mock('@rollup/plugin-multi-entry', multiEntry)
    const multiEntrySpy = sinon.spy(multiEntryCalled, 'called')

    return { rollupStub, rollupWriteStub, multiEntrySpy, esBuildPluginStub }
  }

  before(async () => {
    libs = await import('../libs')
  })

  afterEach(() => {
    sinon.restore()
    mock.stopAll()
    mockfs.restore()
  })

  it('should build', async () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        output: {
          file: './dist/output.d.ts'
        }
      },
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { rollupStub, rollupWriteStub, multiEntrySpy, esBuildPluginStub } = createStubs()

    await esbuild(options)

    expect(rollupStub.called).toBeTrue()
    expect(esBuildPluginStub.called).toBeTrue()
    expect(rollupWriteStub.called).toBeTrue()
    expect(multiEntrySpy.called).toBeFalse()
  })

  it('should build with multiple input esbuild is disabled', async () => {

    const options: CreateRollupConfigOptions = {
      config: {
        input: [ './src/input.ts' ],
        output: {
          file: './dist/output.d.ts'
        }
      },
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { multiEntrySpy, esBuildPluginStub } = createStubs()

    await esbuild(options)

    expect(esBuildPluginStub.called).toBeFalse()
    expect(multiEntrySpy.called).toBeTrue()
  })

  it('should build with multple config ', async () => {
    const options: CreateRollupConfigOptions = {
      config: [
        {
          input: './src/input.ts',
          output: {
            file: './dist/output.d.ts'
          }
        }
      ],
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { esBuildPluginStub } = createStubs()

    await esbuild(options)

    expect(esBuildPluginStub.called).toBeTrue()
  })

  it('should build with plugins,external and multiple output', async () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: [ 
          libs.nodeResolve()
        ],
        output: [
          {
            file: './dist/output.d.ts',
            format: 'es'
          },
          {
            file: './dist/output.d.ts',
            format: 'cjs'
          }
        ]
      },
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { esBuildPluginStub } = createStubs()

    await esbuild(options)

    expect(esBuildPluginStub.called).toBeTrue()
  })

  it('should build with plugins typeof PluginBeforeAfter', async () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: {
          before: [ libs.nodeResolve() ],
          after: []
        },
        output: {
          file: './dist/output.d.ts',
          format: 'es'
        },
      },
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    createStubs()

    await esbuild(options)

  })

})