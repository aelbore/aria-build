import * as assert from 'assert'
import * as mock from 'mock-fs'
import { resolve } from 'path'
import { TSRollupConfig } from './ts-rollup-config.js'
import { bundle } from './build'
import { globFiles, exist } from './fs'

describe('build', () => {
  let cache: NodeModule

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
      'src/file.ts': `
        import * as fs from 'fs'
        import * as path from 'path'

        function mkdirp(directory: string): void {
          const dirPath = path.resolve(directory).replace(/\/$/, '').split(path.sep);
          for (let i = 1; i <= dirPath.length; i++) {
            const segment = dirPath.slice(0, i).join(path.sep);
            if (!fs.existsSync(segment) && segment.length > 0) {
              fs.mkdirSync(segment);
            }
          }
        }

        export { mkdirp }
      `,
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
      assert.strictEqual(await exist(filePath), true)
    }

    assert.strictEqual(Array.isArray(files), true)
    assert.strictEqual(files.length, 4)
    await Promise.all([
      assertFiles('./dist/file.js'),
      assertFiles('./dist/file.d.ts'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])
  })

})