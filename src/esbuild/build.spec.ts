import * as sinon from 'sinon'
import * as mock from 'mock-require'
import * as mockfs from 'mock-fs'

import { esbuild } from './build'
import { CreateRollupConfigOptions } from '../common/common'
import { expect } from 'aria-mocha'

describe('esbuild [esbuild]', () => {
  let libs: typeof import('../libs')
  let swc: typeof import('../plugins/rollup-plugin-swc')
  let esbuildPlugin: typeof import('../plugins/rollup-plugin-esbuild')

  function createStubs() {
    const rollup = {
      close: () => Promise.resolve(void 0),
      closed: true,
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
    
  const rollupGenerateStub = sinon
      .stub(rollup, 'generate')
      .returns(Promise.resolve({} as Promise<import('rollup').RollupOutput>))

    const esBuildPluginStub = sinon
      .stub(esbuildPlugin, 'esBuildPlugin')
      .returns(void 0)

    const terserStub = sinon.stub(libs, 'terser').returns(void 0)

    const swcPluginStub = sinon.stub(swc, 'swcPlugin').returns(void 0)

    const multiEntryCalled = {
      called() { }
    }
    const multiEntry = function() { 
      multiEntryCalled.called()
    } 
    mock('@rollup/plugin-multi-entry', multiEntry)
    const multiEntrySpy = sinon.spy(multiEntryCalled, 'called')

    mock('@rollup/plugin-commonjs', () => { })

    return { rollupGenerateStub, terserStub, swcPluginStub, rollupStub, rollupWriteStub, multiEntrySpy, esBuildPluginStub }
  }

  before(async () => {
    [ libs, swc, esbuildPlugin ] = await Promise.all([ 
      import('../libs'),
      import('../plugins/rollup-plugin-swc'),
      import('../plugins/rollup-plugin-esbuild')
    ])
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
      write: true,
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

  it('should build with swc option enabled and disabled write', async () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        output: {
          file: './dist/output.d.ts'
        }
      },
      swc: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { rollupStub, rollupGenerateStub, swcPluginStub, rollupWriteStub, multiEntrySpy, esBuildPluginStub } = createStubs()

    await esbuild(options)

    expect(rollupStub.called).toBeTrue()
    expect(esBuildPluginStub.called).toBeFalse()
    expect(swcPluginStub.called).toBeTrue()
    expect(rollupWriteStub.called).toBeFalse()
    expect(rollupGenerateStub.called).toBeTrue()
    expect(multiEntrySpy.called).toBeFalse()
  })

  it('should build with multiple input esbuild is disabled', async () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: [ './src/input.ts' ],
        output: {
          file: './dist/output.d.ts'
        },
        compress: true
      },
      write: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { multiEntrySpy, esBuildPluginStub, terserStub } = createStubs()

    await esbuild(options)

    expect(esBuildPluginStub.called).toBeFalse()
    expect(multiEntrySpy.called).toBeTrue()
    expect(terserStub.called).toBeTrue()
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
      write: true,
      esbuild: true,
      name: 'aria-build'
    }

    mockfs({
      'dist': {},
      './src/input.ts': 'console.log(``)'
    })

    const { esBuildPluginStub, terserStub } = createStubs()

    await esbuild(options)

    expect(esBuildPluginStub.called).toBeTrue()
    expect(terserStub.called).toBeFalse()
  })

  it('should build with plugins,external and multiple output', async () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: [],
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
      write: true,
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
          before: [],
          after: []
        },
        output: {
          file: './dist/output.d.ts',
          format: 'es'
        },
      },
      write: true,
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