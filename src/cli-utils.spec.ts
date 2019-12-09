import * as assert from 'assert'
import * as mock from 'mock-fs'
import * as path from 'path'
import { AriaConfigOptions } from './cli-common'
import { createGlobalsFromConfig, getUmdGlobals, mergeGlobals, getAriaConfig } from './cli-utils'
import { mkdirp, writeFile } from './fs'
import { clean } from 'aria-fs'

describe('CLI utils', () => {

  afterEach(async () => {
    mock.restore()
    await clean('build')
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
    assert.ok(ariaConfig)
    assert.strictEqual(Array.isArray(ariaConfig.plugins), true)
    assert.strictEqual(ariaConfig.hasOwnProperty('globals'), false)
  })
  
})