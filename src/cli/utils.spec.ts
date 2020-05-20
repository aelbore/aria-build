import * as mockfs from 'mock-fs'

import { parseConfig, getPkgDependencies, mergeGlobals, parsePlugins, entryFile, getExternalDeps, updateExternalWithResolve } from './utils'
import { PackageFile } from '../common/common'
import { expect } from 'aria-mocha'
import { AriaConfigOptions } from './common'

describe('cli-utils', () => {

  afterEach(() => {
    mockfs.restore()
  })

  describe('parseConfig', () => {

    it('should parseConfig', () => {
      mockfs({
        'aria.config.ts': ''
      })
  
      const config = parseConfig({ config: './aria.config.ts' })
    })
  
    it('should parseConfig without parameters', () => {
      mockfs({
        'aria.config.ts': ''
      })
  
      const config = parseConfig()
    })
  
    it('should parseConfig with entry', () => {
      mockfs({
        'demo': {
          'input.ts': '',
          'aria.config.ts': ''
        },
        'aria.config.ts': ''
      })
  
      const config = parseConfig({ entry: './demo/input.ts' })
    })
  
    it('should parseConfig config and entry is not exist', () => {
      mockfs({ 
        'dist': {}
      })
      const config = parseConfig({ entry: './demo/input.ts' })
    })
  
  })

  describe('getPkgDependencies', () => {

    it('should get dependencies', () => {
      const pkg: PackageFile = {
        dependencies: {
          'vue': '2.0.1'
        }
      }
  
      const dependencies = getPkgDependencies(pkg)
  
      expect(dependencies.length).equal(1)
    })
  
    it('should get devDependencies', () => {
      const pkg: PackageFile = {
        devDependencies: {
          'vue': '2.0.1'
        }
      }
  
      const dependencies = getPkgDependencies(pkg)
  
      expect(dependencies.length).equal(1)
    })
  
    it('should get peerDependencies', () => {
      const pkg: PackageFile = {
        peerDependencies: {
          'vue': '2.0.1'
        }
      }
  
      const dependencies = getPkgDependencies(pkg)
  
      expect(dependencies.length).equal(1)
    })
  
  })

  describe('mergeGlobals', () => {

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
  
      const result = mergeGlobals(
        ariaConfig.output.globals,
        "litElement=lit-element,@angular/core=ng.core"
      )
  
      expect(result.split(',').length)
        .equal(Object.keys(expectedGlobals).length)
    })
  
    it('should merge [mergeGlobals] option.globals and config.globals are null', () => {
      const result = mergeGlobals()
    })

  })

  describe('parsePlugins', () => {

    it('should parsePlugins when plugins are type of array', () => {
      const copy = ({ targets: [] }) => true
      const plugins = [
        copy({
          targets: [
            { src: 'bin/*', dest: 'dist/bin' }
          ]
        })
      ]
  
      const result = parsePlugins(plugins)
    })
  
    it('should parsePlugins when plugins has before and after', () => {
      const copy = ({ targets: [] }) => true
      const plugins = {
        before: [],
        after: []
      }
  
      const result = parsePlugins(plugins)
    })
  
    it('should parsePlugins when plugins is empty', () => {
      const result = parsePlugins()
    })
  
  })

  describe('entryFile', () => {

    it('should get the entryFile w/o module', () => {
      const formats = [ 'es', 'cjs' ]

      const name = entryFile(formats, 'aria-build')
      expect(name).equal('aria-build.es.js')
    })

    it('should get the entryFile with module', () => {
      const formats = [ 'es', 'cjs', 'umd' ]

      const name = entryFile(formats, 'aria-build', 'umd')
      expect(name).equal('aria-build.umd.js')
    })

    it('should get the entryFile with single formats', () => {
      const formats = 'es'

      const name = entryFile(formats, 'aria-build', 'umd')
      expect(name).equal('aria-build.js')
    })

    it('should get the entryFile with single formats', () => {
      const formats = [ 'es' ]

      const name = entryFile(formats, 'aria-build')
      expect(name).equal('aria-build.js')
    })

  })

  describe('getExternalDeps', () => {

    it('should getExternalDeps', () => {

      const dependencies = []
      getExternalDeps({ dependencies  })

    })
      
  })

  describe('updateExternalWithResolve', () => {

    it('should update external with resolve to true', () => {

      const external = updateExternalWithResolve({
        resolve: true,
        external: [ 'react' ]
      })

      expect(external.length).equal(0)
    })

    it('should update external with resolve typeof string', () => {

      const external = updateExternalWithResolve({
        resolve: 'react',
        external: [ 'react' ]
      })

      expect(external.length).equal(0)
    })

    it('should update external w/o resolve', () => {

      const external = updateExternalWithResolve()

      expect(external.length).equal(0)
    })

  }) 

})