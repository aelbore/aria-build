import * as sinon from 'sinon'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { DEFAULT_VALUES } from '../utils/utils'
import { createTSRollupConfig, TSRollupConfig, createTSConfig, CreateTSConfigOptions } from './ts-rollup-config'

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
    expect(file).equal(path.resolve(config.output.file))
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

})

