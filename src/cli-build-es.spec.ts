
import * as pkgJson from '../package.json'
import * as assert from 'assert'
import * as path from 'path'
import * as mock from 'mock-fs';
import { buildES } from './cli-build-es'
import { BuildFormatOptions } from './cli-common';

describe('buildES config', () => {
  let dependencies: string[], params: BuildFormatOptions;

  beforeEach(() => {
    dependencies = Object.keys(pkgJson.dependencies)
    params = { 
      pkgName: 'aria-build', 
      entry: './src/index.ts', 
      output: 'dist', 
      dependencies,
      sourcemap: false,
      declaration: true, 
      plugins: [], 
      format: 'es,cjs',
    }
  })

  afterEach(() => {
    mock.restore()
  })

  it('should use entry option as input.', () => {    
    const expectedInput =  './src/hello-world.ts'
    const configOptions = buildES({ ...params, entry: './src/hello-world.ts' })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.input, expectedInput)
  })

  it('should use package name as input, when entry is null.', () => {
    const expectedInput = 'src/aria-build.ts'

    mock({ [expectedInput]: '' })
    
    delete params.entry
    const configOptions = buildES(params)

    assert.ok(configOptions)
    assert.strictEqual(
      path.normalize(configOptions.input), 
      path.normalize(expectedInput)
    )
  })

  it('should use the entry option as output file', () => {
    const entry = './src/hello-world.ts'
    mock({ [entry]: '' })

    /// has more that 1 format
    let configOptions = buildES({ ...params, entry })

    assert.strictEqual(
      path.normalize(configOptions.output.file), 
      path.normalize('./dist/hello-world.es.js')
    )

    /// has only 1 format
    params.format = 'es'
    configOptions = buildES({ ...params, entry })

    assert.strictEqual(
      path.normalize(configOptions.output.file), 
      path.normalize('./dist/hello-world.js')
    )
  })

  it('should use the package name as output file, when entry is null', () => {
    mock({ 'dist/aria-build.ts': '' })

    delete params.entry

    /// has more that 1 format
    let configOptions = buildES(params)

    assert.strictEqual(
      path.normalize(configOptions.output.file), 
      path.normalize('./dist/aria-build.es.js')
    )
                                
    /// has only 1 format
    params.format = 'es'
    configOptions = buildES(params)

    assert.strictEqual(
      path.normalize(configOptions.output.file), 
      path.normalize('./dist/aria-build.js')
    )
  })

  it('should not add the terser plugin when the compress option is false', () => {
    const configOptions = buildES(params)

    const plugins = Array.isArray(configOptions.plugins) ? configOptions.plugins: [];
    assert.strictEqual(plugins.length, 0)
  })

  it('should have external and get it to package.json dependencies by default.', () => {
    const configOptions = buildES(params)

    assert.ok(configOptions)
    assert.ok(configOptions.external)
    assert.strictEqual(configOptions.external.length, dependencies.length);
    configOptions.external.forEach(e => {
      const findOne = dependencies.find(d => d === e);
      assert.ok(findOne)
    })
  })

  it('should change the output directory when --output has value.', () => {
    let configOptions = buildES({ ...params, output: 'public', entry: './src/hello-world.ts' })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.output.file, './public/hello-world.es.js')

    params.format = 'es'
    configOptions = buildES({ ...params, output: 'public', entry: './src/hello-world.ts' })

    assert.strictEqual(configOptions.output.file, './public/hello-world.js')
  })
})