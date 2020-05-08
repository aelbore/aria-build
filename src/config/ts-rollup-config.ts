import { basename, join, parse } from 'path'
import { CompilerOptions, CustomTransformers } from 'typescript'

import { commonjs, nodeResolve, typescript2 } from '../libs'
import { 
  RollupConfigBase, ConfigResult, 
  CreateRollupConfigOptions, RollupConfigOutput, 
  createInputOptions, createOutputOptions 
} from './base-config'

import { InputOptions } from './base-config'
import { getPackageNameSync } from '../utils/utils'

export interface TSConfigOptions {
  compilerOptions?: CompilerOptions,
  transformers?: CustomTransformers,
  exclude?: string[]
  include?: string[]
}

export interface TSRollupConfig extends RollupConfigBase  {
  tsconfig?: TSConfigOptions
  ts?: boolean
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
        lib: [ 'dom', 'es2015', 'es2017', 'es2018' ],
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

export function createTSRollupInputOptions(options: CreateRollupConfigOptions) {
  const { config, name } = options
  const { resolveOpts, commonOpts, input, output, tsconfig } = config as TSRollupConfig
 
  const _plugins = (config as TSRollupConfig).plugins
  const beforePlugins = Array.isArray(_plugins)
    ? []
    : _plugins?.before ?? []

  const afterPlugins = Array.isArray(_plugins) 
    ? _plugins
    : _plugins?.after ?? []

  const plugins = [
    ...beforePlugins,
    (!Array.isArray(output))
      && typescript2(createTSConfig({ input, tsconfig, file: output.file })),
    commonjs({
      ...(commonOpts ?? {})
    }),
    nodeResolve({ 
      ...(resolveOpts ?? {}) 
    }),
    ...afterPlugins
  ]

  const configOptions = {
    ...(config as Omit<TSRollupConfig, 'output'>),
    plugins
  } 

  return createInputOptions({ config: configOptions, name })
}

export function createTSRollupConfig(options: TSRollupConfig) {
  return _createTSRollupConfig({ config: options })
}

export function _createTSRollupConfig(options: CreateRollupConfigOptions) { 
  const inputOptions = createTSRollupInputOptions(options) 
  const outputOptions = createOutputOptions(options)
  return ({ inputOptions, outputOptions }) as ConfigResult
}

export function createTSRollupConfigs(options: CreateRollupConfigOptions) {
  const config = options.config as TSRollupConfig
  const { input, tsconfig } = config

  const outputs = Array.isArray(config.output) ? config.output: [ config.output ]
  const inputOptions = createTSRollupInputOptions(options)

  const plugins = inputOptions.plugins as any[]
  const index = plugins.findIndex(plugin => typeof plugin == 'boolean')

  const ts = (file: string) => typescript2(createTSConfig({ input, tsconfig, file }))

  const result: ConfigResult[] = outputs.map(output => {
    index !== -1 && plugins.splice(index, 1, ts(output.file))
    const outputOptions = createOutputOptions({ 
      config: { output },
      name: options.name
    })    
    return { inputOptions, outputOptions }
  })

  return result
}