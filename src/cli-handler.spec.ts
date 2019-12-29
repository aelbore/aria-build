
import * as assert from 'assert'
import * as mock from 'mock-fs'
import { resolve } from 'path'
import { BuildOptions, DEFAULT_OUT_DIR } from './cli-common'
import { handler } from './cli-handler'
import { readFile, globFiles, exist } from './fs';

describe('CLI [handler]', () => {
  let cache: NodeModule
  let defaultMocks: any
  let content: string

  const assertFiles = async (filePath: string) => {
    assert.strictEqual(await exist(filePath), true)
  }

  before(async () => {
    content = await readFile('./fixtures/hello-world.ts', 'utf-8')
    const mkdirpContent = await readFile('./fixtures/mkdirp.ts', 'utf-8')
    defaultMocks = {
      'dist': {},
      'src/file.ts': mkdirpContent,
      'README.md': '',
      'package.json': `
        {
          "name": "aria-sample"
        }
      `
    }
  })

  beforeEach(() => {
    cache = require.cache[resolve('package.json')]
    delete require.cache[resolve('package.json')]
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
    await Promise.all([
      assertFiles('./dist/aria-sample.es.js'),
      assertFiles('./dist/aria-sample.js'),
    ])
  })

  it('should build the input when <package-name>.ts file exist.', async() => {
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
    await Promise.all([
      assertFiles('./dist/aria-sample.es.js'),
      assertFiles('./dist/aria-sample.js'),
    ])
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
    await Promise.all([ assertFiles('./dist/file.es.js'), assertFiles('./dist/file.js') ])
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

    assertFiles('./dist/aria-sample.d.ts')
  })

  it('should build single format(es) custom elements.', async () => {
    const options: BuildOptions = {
      declaration: false,
      format: 'es',
      output: DEFAULT_OUT_DIR,
      clean: DEFAULT_OUT_DIR,
      sourcemap: true,
      compress: false
    }

    mock({
      'dist': {},
      'src/index.ts': content,
      'README.md': '',
      'package.json': `
        {
          "name": "hello-world"
        }
      `
    })

    await handler(options)

    const files = await globFiles('./dist/**/*')

    assert.strictEqual(Array.isArray(files), true)
    assert.strictEqual(files.length, 4)
    await Promise.all([
      assertFiles('./dist/hello-world.js'),
      assertFiles('./dist/hello-world.js.map'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])
  })

  it('should build multiple format (es,umd) custom elements.', async () => {
    const options: BuildOptions = {
      declaration: false,
      format: 'es,umd',
      output: DEFAULT_OUT_DIR,
      clean: DEFAULT_OUT_DIR,
      sourcemap: true,
      compress: false
    }

    mock({
      'dist': {},
      'src/index.ts': content,
      'README.md': '',
      'package.json': `
        {
          "name": "hello-world"
        }
      `
    })

    await handler(options)

    const files = await globFiles('./dist/**/*')

    assert.strictEqual(Array.isArray(files), true)
    assert.strictEqual(files.length, 6)
    await Promise.all([
      assertFiles('./dist/hello-world.es.js'),
      assertFiles('./dist/hello-world.es.js.map'),
      assertFiles('./dist/hello-world.umd.js'),
      assertFiles('./dist/hello-world.umd.js.map'),
      assertFiles('./dist/package.json'),
      assertFiles('./dist/README.md')
    ])
  })
})