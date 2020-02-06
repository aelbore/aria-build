import * as mock from 'mock-fs'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { AriaConfigOptions, PluginOptions, PluginBeforeAfter } from './cli-common'
import { createGlobalsFromConfig, getUmdGlobals, mergeGlobals, getAriaConfig, getEntryFile, getExternalDeps, parsePlugins, parseConfig } from './cli-utils'
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
    expect(globals.join(',')).equal(expected)
  })

  it('should [getUmdGlobals]', () => {
    const expected = {
      "litElement": "lit-element",
      "litHtml": "lit-html" 
    }

    const result = getUmdGlobals("litElement=lit-element,litHtml=lit-html")
    
    Object.keys(result).forEach(key => {
      expect(expected[key]).toBeDefined()
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

    expect(Object.keys(result).length).equal(3)
    Object.keys(result).forEach(key => {
      expect(result[key]).equal(expectedGlobals[key])
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

    expect(ariaConfig).toBeDefined()
    expect(ariaConfig.output).toBeDefined()
    expect(ariaConfig.output.globals).toBeDefined()
    expect(Object.keys(ariaConfig.output.globals).length).equal(2)
    expect(Array.isArray(ariaConfig.plugins)).toBeTrue()
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

    expect(ariaConfig).toBeDefined()
    expect(Array.isArray(ariaConfig.plugins)).toBeTrue()
    expect(ariaConfig.hasOwnProperty('globals')).toBeFalse()
  })

  it('should [getEntryFile] when index.ts is exist.', () => {
    mock({
      'src/index.ts': ''
    })

    const input = getEntryFile('aria-build');
    expect(path.normalize(input)).equal(path.normalize('./src/index.ts'))
  })

  it('should [getEntryFile] when index.js is exist.', () => {
    mock({
      'src/index.js': ''
    })

    const input = getEntryFile('aria-build');
    expect(path.normalize(input)).equal(path.normalize('./src/index.js'))
  })
  
  it('should [getEntryFile] when <package-name>.ts is exist.', () => {
    mock({
      'src/aria-build.ts': ''
    })

    const input = getEntryFile('aria-build');
    expect(path.normalize(input)).equal(path.normalize('./src/aria-build.ts'))
  })

  it('should [getEntryFile] when <package-name>.js is exist.', () => {
    mock({
      'src/aria-build.js': ''
    })

    const input = getEntryFile('aria-build');
    expect(path.normalize(input)).equal(path.normalize('./src/aria-build.js'))
  })

  it('should [getEntryFile] throw an error when no entry file exist.', () => {
    mock({
      'src/file.ts': ''
    })

    expect(() => getEntryFile('aria-build')).toThrow('Entry file is not exist.')
  })

  it('should [getExternalDeps] when external has values.', () => {
    const external = 'rollup,aria-fs'
    const results = getExternalDeps({ external, dependencies: [] })

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBeTrue()
    results.forEach(result => {
      expect(external.split(',').find(value => value === result)).toBeDefined()
    })
  })

  it('should [getExternalDeps] when external has NO values.', () => {
    const results = getExternalDeps({})

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBeTrue()
  })

  it('should [getExternalDeps] when dependencies has values.', () => {
    const dependencies = [ 'rollup', 'aria-fs' ]
    const results = getExternalDeps({ dependencies })

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBeTrue()
    results.forEach(result => {
      expect(dependencies.find(value => value === result)).toBeDefined()
    })
  })

  it('should [parsePlugins] return array of plugins type any[]', async () => {
    const copy = ({ targets: [] }) => true
    const plugins: PluginOptions = [
      copy({
        targets: [
          { src: 'bin/*', dest: 'dist/bin' }
        ]
      })
    ]

    const result = parsePlugins(plugins)

    expect(Array.isArray(result)).toBeTrue()
    expect((result as PluginBeforeAfter).after).toBeUndefined()
    expect((result as PluginBeforeAfter).before).toBeUndefined()
  })

  it('should [parsePlugins] return type PluginBeforeAfter of plugins', async () => {
    const copy = ({ targets: [] }) => true
    const inline = () => true
    const plugins: PluginBeforeAfter = {
      before: [ inline() ],
      after: [
        copy({
          targets: [
            { src: 'bin/*', dest: 'dist/bin' }
          ]
        })
      ]
    }

    const result = parsePlugins(plugins)

    expect(Array.isArray(result)).toBeFalse()

    const results = result as PluginBeforeAfter
    expect(results.after).toBeDefined()
    expect(results.before).toBeDefined()
    expect(Array.isArray(results.after)).toBeTrue()
    expect(Array.isArray(results.before)).toBeTrue()
    expect(results.after.length).equal(1)
    expect(results.before.length).equal(1)
  })

  it('should [parseConfig] return the config provided', () => {
    const config = parseConfig('./aria.config.ts')
    expect(config).equal('./aria.config.ts')
  })

})