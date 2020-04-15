import { basename, join, parse } from 'path'
import { CompilerOptions, CustomTransformers } from 'typescript'

import { commonjs, nodeResolve, typescript2 } from '../libs'
import { RollupConfigBase, createRollupConfig, ConfigResult } from './base-config'

export interface TSConfigOptions {
  compilerOptions?: CompilerOptions,
  transformers?: CustomTransformers,
  exclude?: string[]
  include?: string[]
}

export interface TSRollupConfig extends RollupConfigBase  {
  tsconfig?: TSConfigOptions
}

export interface CreateTSConfigOptions {
  input?: string | string[]
  file?: string
  tsconfig?: TSConfigOptions
  pluginOpts?: any
}

export interface TSRollupPluginResult {
  tsconfigDefaults: {
    compilerOptions?: Omit<CompilerOptions, 'module' | 'moduleResolution' | 'target'>
    exclude?: string[]
    include?: string[]
  },
  transformers?: any[]
  check?: boolean
  objectHashIgnoreUnknownHack?: boolean
  useTsconfigDeclarationDir?: boolean
  cacheRoot?: string
}

export function createTSConfig(options: CreateTSConfigOptions) { 
  const { input, file, tsconfig, pluginOpts } = options

  const transformers = () => ({
    ...(tsconfig?.transformers ?? {})
  })

  const cachefolder = file ? parse(basename(file)).name: '.rts2_cache'
  const compilerOptions = tsconfig?.compilerOptions ?? {}

  const config: TSRollupPluginResult = {
    transformers: [ transformers ],
    tsconfigDefaults: {
      compilerOptions: {
        baseUrl: '.',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        declaration: false,
        allowJs: true,
        lib: [ 'dom', 'es2015', 'es2017' ],
        module: 'es2015',
        moduleResolution: 'node',
        target: 'es2018',
        ...compilerOptions
      },
      ...{ include: Array.isArray(input) ? input: [ input ] },
      ...{ exclude: tsconfig?.exclude ?? [] }
    },
    check: false,
    objectHashIgnoreUnknownHack: false,
    cacheRoot: join('./node_modules/.tmp', cachefolder), 
    /// compilerOptions.declation = true
    /// create dts files
    /// useTsconfigDeclarationDir === false and compilerOptions.declation = true
    /// create dts files
    useTsconfigDeclarationDir: compilerOptions.declaration ? false: true,
    ...(pluginOpts ?? {})
  }

  return config
}

export function createTSRollupConfig(options: TSRollupConfig) {
  const { resolveOpts, commonOpts, input, compress, tsconfig } = options

  const insertPlugin = (plugins: any[], index: number, value: any) => {
    plugins.splice(index, 0, value)
  }
 
  const beforePlugins = Array.isArray(options.plugins)
    ? []
    : options.plugins?.before ?? []

  const afterPlugins = Array.isArray(options.plugins) 
    ? options.plugins
    : options.plugins?.after ?? []

  const plugins = [
    ...beforePlugins,
    commonjs({
      ...(commonOpts ?? {})
    }),
    nodeResolve({ 
      ...(resolveOpts ?? {}) 
    }),
    ...afterPlugins
  ]

  const config: RollupConfigBase = {
    ...options,
    plugins
  } 

  const { inputOptions, outputOptions } = createRollupConfig({ config })
  const { file } = outputOptions

  const pluginValues = inputOptions.plugins as any[]
  insertPlugin(pluginValues, 
    compress ? pluginValues.length - 1: pluginValues.length, 
    typescript2(createTSConfig({ input, tsconfig, file }))
  )

  const configResult: ConfigResult = { 
    inputOptions, 
    outputOptions 
  }

  return configResult
}