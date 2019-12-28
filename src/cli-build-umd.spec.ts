
import * as pkgJson from '../package.json'
import * as assert from 'assert'
import * as mock from 'mock-fs';
import { normalize } from 'path'
import { BuildFormatOptions } from './cli-common';
import { buildUmd } from './cli-build-umd';

describe('buildUmd config', () => {
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
      format: 'es,cjs,umd',
    }
  })

  afterEach(() => {
    mock.restore()
  })

  it('should use entry option as input.', () => {    
    const entry =  './src/hello-world.ts'
    const configOptions = buildUmd({ ...params, entry })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.input, entry)
  })

  it('should use package name as input, when entry is null.', () => {
    const entry = 'src/aria-build.ts'

    mock({ [entry]: '' })
    
    delete params.entry
    const configOptions = buildUmd(params)

    assert.ok(configOptions)
    assert.strictEqual(normalize(configOptions.input), normalize(entry))
  })

  it('should use the entry option as output file', () => {
    const entry = './src/hello-world.ts'
    mock({ [entry]: '' })

    const configOptions = buildUmd({ ...params, entry })

    assert.strictEqual(normalize(configOptions.output.file), normalize('./dist/hello-world.umd.js'))
  })

  it('should use the package name as output file, when entry is null', () => {
    mock({ 
      'src/aria-build.ts': '' 
    })

    delete params.entry

    const configOptions = buildUmd(params)
    assert.strictEqual(
      normalize(configOptions.output.file), 
      normalize('./dist/aria-build.umd.js')
    )                           
  })

  it('should have plugins when format is only umd.', () => {
    const entry =  './src/hello-world.ts'
    
    params.format = 'umd'
    const configOptions = buildUmd({ ...params, entry })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.hasOwnProperty('plugins'), true)
  })

  it('should have external and get it to package.json dependencies by default.', () => {
    const configOptions = buildUmd(params)

    assert.ok(configOptions)
    assert.ok(configOptions.external)
    assert.strictEqual(configOptions.external.length, dependencies.length);
    configOptions.external.forEach(e => {
      const findOne = dependencies.find(d => d === e);
      assert.ok(findOne)
    })
  })

  it('should change the output directory when --output has value.', () => {
    let configOptions = buildUmd({ ...params, output: 'public', entry: './src/hello-world.ts' })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.output.file, './public/hello-world.umd.js')

    params.format = 'umd'
    configOptions = buildUmd({ ...params, output: 'public', entry: './src/hello-world.ts' })

    assert.strictEqual(configOptions.output.file, './public/hello-world.js')
  })

  it('should have globals from --globals option', () => {
    const expectedGlobals = {
      "litElement": "lit-element",
      "litHtml": "lit-html" 
    }
    params.globals = "litElement=lit-element,litHtml=lit-html"

    const configOptions = buildUmd({ ...params })
    const globals = configOptions.output.globals

    assert.strictEqual(Object.keys(globals).length, 2)
    Object.keys(globals).forEach(key => {
      assert.ok(expectedGlobals[key])
    })
  })

})