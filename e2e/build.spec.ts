import * as mockfs from 'mock-fs'
import * as mock from 'mock-require'

import { existsSync } from 'fs'
import { resolve } from 'path'
import { expect } from 'aria-mocha'
import { TSRollupConfig, esbuild } from '../src'

describe('build', () => {

  before(async () => {
    const [ swc, esbuild, commonjs ] = await Promise.all([
      import('@swc/core'),
      import('esbuild'),
      import('@rollup/plugin-commonjs')
    ])
    mock('esbuild', esbuild)
    mock('@swc/core', swc)
    mock('@rollup/plugin-commonjs', commonjs)
  })

  after(() => {
    mock.stopAll()
  })

  beforeEach(async() => {
    mockfs({
      'dist': {},
      './src/index.ts': `export const hello = (msg: string) => 'Hello ' + msg `,
      './plugins/index.ts': `export const transform = () => console.log('')`
    })

    mock(resolve('package.json'), {  
      name: 'aria'
    })
  })

  afterEach(() => {
    mockfs.restore()
  })

  it('should build with multiple configs esbuild enabled', async() => {
    const tsconfig = {
      compilerOptions: {
        declaration: true
      }
    }

    const config: TSRollupConfig[] = [
      {
        input: './src/index.ts',
        output: [
          {
            format: 'es', 
            sourcemap: true,
            file: './dist/output.es.js'
          },
          {
            format: 'cjs', 
            sourcemap: true,
            file: './dist/output.js'
          }
        ],
        tsconfig
      },
      {
        input: './plugins/index.ts',
        output: {
          format: 'es', 
          file: './dist/plugins/plugin.js'
        },
        tsconfig
      }
    ]

    await esbuild({ config, esbuild: true, write: true })

    expect(existsSync('./dist/output.js')).toBeTrue()
    expect(existsSync('./dist/output.js.map')).toBeTrue()
    expect(existsSync('./dist/output.es.js')).toBeTrue()
    expect(existsSync('./dist/output.js.map')).toBeTrue()
    expect(existsSync('./dist/plugins/plugin.js')).toBeTrue()
  })

  it('should build with multiple configs swc enabled', async() => {
    const tsconfig = {
      compilerOptions: {
        declaration: true
      }
    }

    const config: TSRollupConfig[] = [
      {
        input: './src/index.ts',
        output: [
          {
            format: 'es', 
            sourcemap: true,
            file: './dist/output.es.js'
          },
          {
            format: 'cjs', 
            sourcemap: true,
            file: './dist/output.js'
          }
        ],
        tsconfig
      },
      {
        input: './plugins/index.ts',
        output: {
          format: 'es', 
          file: './dist/plugins/plugin.js'
        },
        tsconfig
      }
    ]

    await esbuild({ config, swc: true, write: true })

    expect(existsSync('./dist/output.js')).toBeTrue()
    expect(existsSync('./dist/output.js.map')).toBeTrue()
    expect(existsSync('./dist/output.es.js')).toBeTrue()
    expect(existsSync('./dist/output.js.map')).toBeTrue()
    expect(existsSync('./dist/plugins/plugin.js')).toBeTrue()
  })

})