import * as mock from 'mock-fs'
import { expect } from 'aria-mocha'
import { resolve } from 'path'
import { TSRollupConfig } from './ts-rollup-config.js'
import { bundle } from './build'
import { globFiles, exist, readFile } from './fs'

describe('build', () => {
  let cache: NodeModule
  let content: string

  const assertFiles = async (filePath: string) => {
    expect(await exist(filePath)).toBeTrue()
  }
  
  before(async () => {
    content = await readFile('./fixtures/mkdirp.ts', 'utf-8')
  })

  beforeEach(() => {
    cache = require.cache[resolve('package.json')]
    delete require.cache[resolve('package.json')]
  })

  afterEach(() => {
    mock.restore()
    require.cache[resolve('package.json')] = cache
  })

  it('should [bundle] single format (es)', async () => {
    const opitions: TSRollupConfig = {
      input: './src/file.ts',
      output: {
        file: './dist/file.js',
        format: 'es'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mock({
      'dist': {},
      'src/file.ts': content,
      'README.md': '',
      'package.json': `
        {
          "name": "aria-sample"
        }
      `
    })

    await bundle(opitions)

    const files = await globFiles('./dist/**/*')

    expect(Array.isArray(files)).toBeTrue()
    expect(files.length).equal(4)
    await Promise.all([
      assertFiles('./dist/file.js'),
      assertFiles('./dist/file.d.ts'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])
  })

  it('should [bundle] single format (es) with multiple inputs', async () => {
    const opitions: TSRollupConfig = {
      input: [ 
        './src/file.ts',
        './src/other-file.ts'
      ],
      output: {
        file: './dist/output.js',
        format: 'es'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mock({
      'dist': {},
      'src/file.ts': content,
      'src/other-file.ts': '',
      'README.md': '',
      'package.json': `
        {
          "name": "aria-sample"
        }
      `
    })

    await bundle(opitions)

    const files = await globFiles('./dist/**/*')
    
    expect(Array.isArray(files)).toBeTrue()
    expect(files.length).equal(7)
    await Promise.all([
      assertFiles('./dist/src/other-file.d.ts'),
      assertFiles('./dist/src/file.d.ts'),
      assertFiles('./dist/output.js'),
      assertFiles('./dist/aria-sample.d.ts'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])
  })

  it('should [bundle] multiple format (es,cjs) target node.', async () => {
    const opitions: TSRollupConfig[] = [
      {
        input: './src/file.ts',
        output: {
          file: './dist/file.es.js',
          format: 'es'
        },
        tsconfig: {
          compilerOptions: {
            declaration: true
          }
        }
      }, 
      {
        input: './src/file.ts',
        output: {
          file: './dist/file.js',
          format: 'cjs'
        }
      }
    ]
    
    mock({
      'dist': {},
      'src/file.ts': content,
      'README.md': '',
      'package.json': `
        {
          "name": "aria-sample"
        }
      `
    })

    await bundle(opitions)

    const files = await globFiles('./dist/**/*')

    expect(Array.isArray(files)).toBeTrue()
    expect(files.length).equal(5)
    await Promise.all([
      assertFiles('./dist/file.js'),
      assertFiles('./dist/file.es.js'),
      assertFiles('./dist/file.d.ts'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])

  })

})