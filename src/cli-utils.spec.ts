import * as assert from 'assert'
import * as mock from 'mock-fs'
import * as path from 'path'
import { AriaConfigOptions } from './cli-common'
import { createGlobalsFromConfig, getUmdGlobals, mergeGlobals, getAriaConfig, getEntryFile, getExternalDeps } from './cli-utils'
import { mkdirp, writeFile } from './fs'
import { clean } from 'aria-fs'

describe('CLI utils', () => {

  afterEach(async () => {
    mock.restore()
  })

  it('should [createGlobalsFromConfig]', () => {
    const expected = "litElement=lit-element,litHtml=lit-html"
    const ariaConfig: AriaConfigOptions = {
      output: {
        globals: {
          "litElement": "lit-element",
          "litHtml": "lit-html" 
        }
      }
    }

    const globals = createGlobalsFromConfig(ariaConfig?.output?.globals)
    assert.strictEqual(globals.join(','), expected)
  })

  it('should [getUmdGlobals]', () => {
    const expected = {
      "litElement": "lit-element",
      "litHtml": "lit-html" 
    }

    const result = getUmdGlobals("litElement=lit-element,litHtml=lit-html")
    
    Object.keys(result).forEach(key => {
      assert.ok(expected[key])
    })
  })

  it('should merge [mergeGlobals] option.globals and config.globals.', () => {
    const expectedGlobals = {
      "litElement": "lit-element",
      "litHtml": "lit-html",
      "@angular/core": "ng.core"
    }

    const ariaConfig: AriaConfigOptions = {
      output: {
        globals: {
          ...expectedGlobals
        }
      }
    }

    const localMergeGlobals = mergeGlobals(
        ariaConfig?.output?.globals,
        "litElement=lit-element,@angular/core=ng.core"
      )

    const result = { 
      ...getUmdGlobals(localMergeGlobals)
    }

    assert.strictEqual(Object.keys(result).length, 3)
    Object.keys(result).forEach(key => {
      assert.ok(result[key], expectedGlobals[key])
    })
  })

  it('should [getAriaConfig] from default aria.config.ts', async () => {
    mock({
      'aria.config.ts': `
        export default {
          plugins: [],
          output: {
            globals: {
              "litElement": "lit-element",
              "litHtml": "lit-html" 
            }
          }
        }
      `
    })

    const ariaConfig = await getAriaConfig()

    assert.ok(ariaConfig)
    assert.ok(ariaConfig.output)
    assert.ok(ariaConfig.output.globals)
    assert.strictEqual(Object.keys(ariaConfig.output.globals).length, 2)
    assert.strictEqual(Array.isArray(ariaConfig.plugins), true)
  })  

  it('should [getAriaConfig] from custom config', async () => {
    const CUSTOM_CONFIG_PATH = './build/aria.config.ts'

    const content = `
      export default {
        plugins: []
      }
    `
    
    mkdirp(path.dirname(CUSTOM_CONFIG_PATH))
    await writeFile(CUSTOM_CONFIG_PATH, content)

    const ariaConfig = await getAriaConfig(CUSTOM_CONFIG_PATH)
    await clean('build')

    assert.ok(ariaConfig)
    assert.strictEqual(Array.isArray(ariaConfig.plugins), true)
    assert.strictEqual(ariaConfig.hasOwnProperty('globals'), false)
  })

  it('should [getEntryFile] when index.ts is exist.', () => {
    mock({
      'src/index.ts': ''
    })

    const input = getEntryFile('aria-build');
    assert.strictEqual(input, './src/index.ts')
  })

  it('should [getEntryFile] when index.js is exist.', () => {
    mock({
      'src/index.js': ''
    })

    const input = getEntryFile('aria-build');
    assert.strictEqual(input, './src/index.js')
  })
  
  it('should [getEntryFile] when <package-name>.ts is exist.', () => {
    mock({
      'src/aria-build.ts': ''
    })

    const input = getEntryFile('aria-build');
    assert.strictEqual(input, './src/aria-build.ts')
  })

  it('should [getEntryFile] when <package-name>.js is exist.', () => {
    mock({
      'src/aria-build.js': ''
    })

    const input = getEntryFile('aria-build');
    assert.strictEqual(input, './src/aria-build.js')
  })

  it('should [getEntryFile] throw an error when no entry file exist.', () => {
    mock({
      'src/file.ts': ''
    })

    try {
      getEntryFile('aria-build');
    } catch(error) {
      assert.throws(() => {
        throw new Error(error)
      }, 'Entry file is not exist.')
    }
  })

  it('should [getExternalDeps] when external has values.', () => {
    const external = 'rollup,aria-fs'
    const results = getExternalDeps({ external, dependencies: [] })

    assert.ok(results)
    assert.strictEqual(Array.isArray(results), true)
    results.forEach(result => {
      assert.ok(external.split(',').find(value => value === result))
    })
  })

  it('should [getExternalDeps] when external has NO values.', () => {
    const results = getExternalDeps({})

    assert.ok(results)
    assert.strictEqual(Array.isArray(results), true)
  })

  it('should [getExternalDeps] when dependencies has values.', () => {
    const dependencies = [ 'rollup', 'aria-fs' ]
    const results = getExternalDeps({ dependencies })

    assert.ok(results)
    assert.strictEqual(Array.isArray(results), true)
    results.forEach(result => {
      assert.ok(dependencies.find(value => value === result))
    })
  })

})