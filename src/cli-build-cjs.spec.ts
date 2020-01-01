
import * as pkgJson from '../package.json'
import * as mock from 'mock-fs'

import { expect } from 'aria-mocha'
import { normalize } from 'path'
import { BuildFormatOptions } from './cli-common'
import { buildCommonJS } from './cli-build-cjs'

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

    expect(configOptions).toBeDefined()
    expect(configOptions.input).equal(entry)
  })

  it('should use package name as input, when entry is null.', () => {
    const entry = 'src/aria-build.ts'

    mock({ 
      [entry]: '' 
    })
    
    delete params.entry
    const configOptions = buildCommonJS(params)

    expect(configOptions).toBeDefined()
    expect(normalize(configOptions.input)).equal(normalize(entry))
  })
  
  it('should use the entry option as output file', () => {
    const entry = './src/hello-world.ts'
    mock({ [entry]: '' })

    const configOptions = buildCommonJS({ ...params, entry })

    expect(normalize(configOptions.output.file)).equal(normalize('./dist/hello-world.js'))
  })

  it('should use the package name as output file, when entry is null', () => {
    mock({ 
      'src/aria-build.ts': '' 
    })

    delete params.entry

    let configOptions = buildCommonJS(params)

    expect(normalize(configOptions.output.file)).equal(normalize('./dist/aria-build.js'))                          
  })

  it('should have plugins when format is only cjs.', () => {
    const entry =  './src/hello-world.ts'
    
    params.format = 'cjs'
    const configOptions = buildCommonJS({ ...params, entry })

    expect(configOptions).toBeDefined()
    expect(configOptions.hasOwnProperty('plugins')).toBeTrue()
  })

  it('should have no plugins when format has more than 1.', () => {
    const entry =  './src/hello-world.ts'
    const configOptions = buildCommonJS({ ...params, entry })

    expect(configOptions).toBeDefined()
    expect(configOptions.hasOwnProperty('plugins')).toBeFalse()
  })

  it('should have declaration when format is only cjs.', () => {
    const entry =  './src/hello-world.ts'
    
    params.format = 'cjs'
    const configOptions = buildCommonJS({ ...params, entry })

    expect(configOptions).toBeDefined()
    expect(configOptions.hasOwnProperty('tsconfig')).toBeTrue()
    expect(configOptions.tsconfig.compilerOptions.hasOwnProperty('declaration')).toBeTrue()
  })

  it('should have external and get it to package.json dependencies by default.', () => {
    const configOptions = buildCommonJS(params)

    expect(configOptions).toBeDefined()
    expect(configOptions.external).toBeDefined()
    expect(configOptions.external.length).equal(dependencies.length);
    configOptions.external.forEach(e => {
      const findOne = dependencies.find(d => d === e);
      expect(findOne).toBeDefined()
    })
  })

  it('should change the output directory when --output has value.', () => {
    let configOptions = buildCommonJS({ ...params, output: 'public', entry: './src/hello-world.ts' })

    expect(configOptions).toBeDefined()
    expect(configOptions.output.file).equal('./public/hello-world.js')

    params.format = 'cjs'
    configOptions = buildCommonJS({ ...params, output: 'public', entry: './src/hello-world.ts' })

    expect(configOptions.output.file).equal('./public/hello-world.js')
  })
}) 