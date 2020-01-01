import * as mock from 'mock-fs'
import { expect } from 'aria-mocha'
import { resolve } from 'path'
import { TSRollupConfig } from './ts-rollup-config.js'
import { bundle } from './build'
import { globFiles, exist, readFile } from './fs'

describe('build', () => {
  let cache: NodeModule
  let content: string
  
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
    const assertFiles = async (filePath: string) => {
      expect(await exist(filePath)).toBeTrue()
    }

    expect(Array.isArray(files)).toBeTrue()
    expect(files.length).equal(4)
    await Promise.all([
      assertFiles('./dist/file.js'),
      assertFiles('./dist/file.d.ts'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])
  })
})