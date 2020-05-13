import * as sinon from 'sinon'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { DEFAULT_VALUES } from '../common/common'
import { createTSRollupConfig, createTSConfig, CreateTSConfigOptions, createTSRollupConfigs } from './ts-rollup-config'
import { CreateRollupConfigOptions } from './base-config'
import { RollupConfigOutput, TSRollupConfig } from './common'

describe('ts-rollup-config', () => {

  afterEach(() => {
    sinon.restore()
  })

  it('should create ts rollup config with comonjs,resolve,compress options', async () => {
    const baseConfig = await import('./base-config')
    const onwarn = sinon.stub(baseConfig, 'onwarn')
    
    const extensions = [ 'tsx' ]
    const config: TSRollupConfig = {
      input: './src/input.ts',
      output: {
        file: './dist/input.js'
      },
      commonOpts: { extensions },
      resolveOpts: { extensions },
      compress: true
    }

    const { inputOptions, outputOptions } = createTSRollupConfig(config)

    const { input, plugins, external } = inputOptions
    const { file } = outputOptions
    
    expect(onwarn.called).toBeFalse()
    expect(input).equal(config.input)
    expect((plugins as any[]).length).equal(4)
    expect(external.length).equal(DEFAULT_VALUES.ROLLUP_EXTERNALS.length)
    expect(path.normalize(file)).equal(path.normalize((config.output as RollupConfigOutput).file))
  })
  
  it('should create ts rollup config with plugins is array', () => {
    const fakePlugin = () => null
    
    const config: TSRollupConfig = {
      input: './src/input.ts',
      plugins: [ fakePlugin() ],
      output: {
        file: './dist/input.js'
      }
    }

    const { inputOptions, outputOptions } = createTSRollupConfig(config)
    const { plugins } = inputOptions

    expect((plugins as any[]).length).equal(4)
    expect((plugins as any[])[0].name).equal('rpt2')
  })
  
  it('should create ts rollup config with plugins typeof PluginBeforeAfter', () => {
    const fakePlugin = () => null
    const afterPlugin = () => null
    
    const config: TSRollupConfig = {
      input: './src/input.ts',
      plugins: {
        before: [ fakePlugin() ],
        after: [ afterPlugin() ]
      },
      output: {
        file: './dist/input.js'
      }
    }

    const { inputOptions } = createTSRollupConfig(config)
    const { plugins } = inputOptions

    expect((plugins as any[]).length).equal(5)
    expect((plugins as any[])[1].name).equal('rpt2')
  })  

  it('should create rollup-plugin-typescript2 config', () => {
    const options: CreateTSConfigOptions = { }

    const config = createTSConfig(options)
    
    /// rollup-plugin-typescript2 
    /// should execute this one
    config.transformers.map(transformer => transformer())

    expect(config.cacheRoot).equal(path.normalize('node_modules/.tmp/.rts2_cache'))
    expect(config.useTsconfigDeclarationDir).toBeTrue()
    expect(config.tsconfigDefaults.exclude.length).equal(0)
  })

  it('should create rollup-plugin-typescript2 config with multiple inputs', () => {
    const options: CreateTSConfigOptions = { 
      input: [ 
        './src/input.ts', 
        './src/fs.ts' 
      ]
    }

    const config = createTSConfig(options)
  })

  it('should create rollup-plugin-typescript2 config with compilerOptions,transformers,pluginOpts,file options', () => {
    const fakeTransformer = () => null

    const options: CreateTSConfigOptions = {
      file: './dist/input.js',
      tsconfig: {
        compilerOptions: {
          sourceMap: true,
          declaration: true
        },
        transformers: {
          before: [ fakeTransformer() ]
        },
        exclude: [ './dist/**/*.spec.ts' ]
      },
      pluginOpts: {
        check: true
      }
    }

    const config = createTSConfig(options)

    /// rollup-plugin-typescript2 
    /// should execute this one
    config.transformers.map(transformer => transformer())
    
    const { tsconfigDefaults, check, cacheRoot, useTsconfigDeclarationDir } = config
    const { sourceMap, module, declaration, target, moduleResolution } = tsconfigDefaults.compilerOptions
    const { compilerOptions } = options.tsconfig

    expect(sourceMap).equal(compilerOptions.sourceMap)
    expect(declaration).equal(compilerOptions.declaration)
    expect(module).equal('es2015')
    expect(moduleResolution).equal('node')
    expect(target).equal('es2018')
    expect(config.transformers.length).equal(1)
    expect(check).toBeTrue()
    expect(cacheRoot).equal(path.join('./node_modules', '.tmp', path.parse(path.basename(options.file)).name))
    expect(useTsconfigDeclarationDir).toBeFalse()
    expect(tsconfigDefaults.exclude.length).equal(1)
  })

  it('should createTSRollupConfigs with multiple outputs', () => {
    const expectedPlugins = [ 'rpt2', 'commonjs', 'node-resolve' ]

    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/index.ts',
        output: [
          {
            format: 'es',
            file: `dist/index.es.js`
          },
          {
            format: 'cjs',
            file: `dist/index.js`
          }
        ]
      },
      name: 'aria'
    }

    const configs = createTSRollupConfigs(options)
    expect(configs.length).equal(2)
    configs.forEach(config => {
      const plugins = config.inputOptions.plugins as any[]
      const findIndex = name => plugins.findIndex(plugin => plugin.name.includes(name))

      expect(plugins.length).equal(3)
      expect(findIndex('rpt2')).equal(0)
      expect(findIndex('commonjs')).equal(1)
      expect(findIndex('node-resolve')).equal(2)
    })
  })

  it('should createTSRollupConfigs with output typeof object', () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/index.ts',
        output: {
          sourcemap: true,
          format: 'es',
          file: `dist/index.es.js`
        }
      },
      name: 'aria'
    }

    const configs = createTSRollupConfigs(options)
    expect(configs.length).equal(1)
    configs.forEach(config => {
      expect((config.inputOptions.plugins as any[]).length).equal(3)
    })
  })

})

