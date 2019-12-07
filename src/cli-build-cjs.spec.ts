
import * as pkgJson from '../package.json'
import * as assert from 'assert'
import * as mock from 'mock-fs';
import { normalize } from 'path'
import { BuildFormatOptions } from './cli-common';
import { buildCommonJS } from './cli-build-cjs';

describe('buildCommonJS config', () => {
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
    const entry =  './src/hello-world.ts'
    const configOptions = buildCommonJS({ ...params, entry })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.input, entry)
  })

  it('should use package name as input, when entry is null.', () => {
    const entry = 'src/aria-build.ts'

    mock({ [entry]: '' })
    
    delete params.entry
    const configOptions = buildCommonJS(params)

    assert.ok(configOptions)
    assert.strictEqual(normalize(configOptions.input), normalize(entry))
  })
  
  it('should use the entry option as output file', () => {
    const entry = './src/hello-world.ts'
    mock({ [entry]: '' })

    const configOptions = buildCommonJS({ ...params, entry })

    assert.strictEqual(normalize(configOptions.output.file), normalize('./dist/hello-world.js'))
  })

  it('should use the package name as output file, when entry is null', () => {
    mock({ 'dist/aria-build.ts': '' })

    delete params.entry

    let configOptions = buildCommonJS(params)

    assert.strictEqual(
      normalize(configOptions.output.file), 
      normalize('./dist/aria-build.js')
    )                           
  })

  it('should have plugins when format is only cjs.', () => {
    const entry =  './src/hello-world.ts'
    
    params.format = 'cjs'
    const configOptions = buildCommonJS({ ...params, entry })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.hasOwnProperty('plugins'), true)
  })

  it('should have no plugins when format has more than 1.', () => {
    const entry =  './src/hello-world.ts'
    const configOptions = buildCommonJS({ ...params, entry })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.hasOwnProperty('plugins'), false)
  })

  it('should have declaration when format is only cjs.', () => {
    const entry =  './src/hello-world.ts'
    
    params.format = 'cjs'
    const configOptions = buildCommonJS({ ...params, entry })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.hasOwnProperty('tsconfig'), true)
    assert.strictEqual(configOptions.tsconfig.compilerOptions.hasOwnProperty('declaration'), true)
  })

  it('should have external and get it to package.json dependencies by default.', () => {
    const configOptions = buildCommonJS(params)

    assert.ok(configOptions)
    assert.ok(configOptions.external)
    assert.strictEqual(configOptions.external.length, dependencies.length);
    configOptions.external.forEach(e => {
      const findOne = dependencies.find(d => d === e);
      assert.ok(findOne)
    })
  })

  it('should change the output directory when --output has value.', () => {
    let configOptions = buildCommonJS({ ...params, output: 'public', entry: './src/hello-world.ts' })

    assert.ok(configOptions)
    assert.strictEqual(configOptions.output.file, './public/hello-world.js')

    params.format = 'cjs'
    configOptions = buildCommonJS({ ...params, output: 'public', entry: './src/hello-world.ts' })

    assert.strictEqual(configOptions.output.file, './public/hello-world.js')
  })
})