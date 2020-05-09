import * as mockfs from 'mock-fs'
import * as mock from 'mock-require'

import { existsSync } from 'fs'
import { resolve } from 'path'
import { expect } from 'aria-mocha'
import { TSRollupConfig, ebuild } from '../src'

describe('build', () => {

  beforeEach(() => {
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
    mock.stopAll()
  })

  it('should build with multiple configs', async() => {
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

    await ebuild({ config })

    expect(existsSync('./dist/output.js')).toBeTrue()
    expect(existsSync('./dist/output.js.map')).toBeTrue()
    expect(existsSync('./dist/output.es.js')).toBeTrue()
    expect(existsSync('./dist/output.js.map')).toBeTrue()
    expect(existsSync('./dist/index.d.ts')).toBeTrue()
    expect(existsSync('./dist/plugins/plugin.js')).toBeTrue()
    expect(existsSync('./dist/plugins/index.d.ts')).toBeTrue()
  })

})