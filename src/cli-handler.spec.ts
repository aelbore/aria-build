
import * as assert from 'assert'
import * as mock from 'mock-fs';
import { BuildOptions, DEFAULT_OUT_DIR } from './cli-common';
import { handler } from './cli-handler';
import { globFiles } from 'aria-fs';
import { basename, resolve } from 'path'

describe('CLI [handler]', () => {
  let cache: NodeModule
  let defaultMocks: any;

  const findFile = (files: string[], strToFind: string) => {
    return files.find(file => basename(file) === strToFind)
  }

  beforeEach(() => {
    cache = require.cache[resolve('package.json')]
    delete require.cache[resolve('package.json')]

    defaultMocks = {
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
    }
  })

  afterEach(() => {
    mock.restore()
    require.cache[resolve('package.json')] = cache
  })

  it('should build the input with index.ts file.', async () => {
    mock({ 
      'src/index.ts': `export * from './file'`,
      ...defaultMocks
    })

    const options: BuildOptions = {
      declaration: false,
      format: 'es,cjs',
      output: DEFAULT_OUT_DIR,
      clean: DEFAULT_OUT_DIR,
      sourcemap: false,
      compress: false
    }

    await handler(options)
    const files = await globFiles('./dist/*.js')

    assert.strictEqual(Array.isArray(files), true)
    assert.strictEqual(files.length, 2)
    assert.ok(findFile(files, 'aria-sample.es.js'))
    assert.ok(findFile(files, 'aria-sample.js'))
  })

  it('should build the input when <package-name>.ts file exist.', async() => {
    delete require.cache[resolve('package.json')]

    mock({ 
      'src/aria-sample.ts': `export * from './file'`,
      ...defaultMocks
    })

    const options: BuildOptions = {
      declaration: false,
      format: 'es,cjs',
      output: DEFAULT_OUT_DIR,
      clean: DEFAULT_OUT_DIR,
      sourcemap: false,
      compress: false
    }

    await handler(options)
    const files = await globFiles('./dist/*.js')

    assert.strictEqual(Array.isArray(files), true)
    assert.strictEqual(files.length, 2)
    assert.ok(findFile(files, 'aria-sample.es.js'))
    assert.ok(findFile(files, 'aria-sample.js'))
  })

  it('should build when --entry option exist.', async () => {
    mock({   
      ...defaultMocks
    })

    const options: BuildOptions = {
      entry: './src/file.ts',
      declaration: false,
      format: 'es,cjs',
      output: DEFAULT_OUT_DIR,
      clean: DEFAULT_OUT_DIR,
      sourcemap: false,
      compress: false
    }

    await handler(options)
    const files = await globFiles('./dist/*.js')

    assert.strictEqual(Array.isArray(files), true)
    assert.strictEqual(files.length, 2)
    assert.ok(findFile(files, 'file.es.js'))
    assert.ok(findFile(files, 'file.js'))
  })

  it('should build with .d.ts or declaration file(s).', async () => {
    mock({     
      'src/index.ts': `export * from './file'`,
      ...defaultMocks
    })

    const options: BuildOptions = {
      declaration: true,
      format: 'es,cjs',
      output: DEFAULT_OUT_DIR,
      clean: DEFAULT_OUT_DIR,
      sourcemap: false,
      compress: false
    }

    await handler(options)
    const files = await globFiles('./dist/*')

    assert.ok(findFile(files, 'aria-sample.d.ts'))
  })

})