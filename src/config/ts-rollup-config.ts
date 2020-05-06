import { basename, join, parse } from 'path'
import { CompilerOptions, CustomTransformers } from 'typescript'

import { commonjs, nodeResolve, typescript2 } from '../libs'
import { 
  RollupConfigBase, ConfigResult, 
  CreateRollupConfigOptions, RollupConfigOutput, 
  createInputOptions, createOutputOptions 
} from './base-config'

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

export function createTSRollupConfig(options: TSRollupConfig) {
  return _createTSRollupConfig({ config: options })
}

export function createTSRollupInputOptions(options: CreateRollupConfigOptions) {
  const { config, name } = options
  const { resolveOpts, commonOpts, output, input, tsconfig } = config as TSRollupConfig
 
  const _plugins = (config as TSRollupConfig).plugins
  const beforePlugins = Array.isArray(_plugins)
    ? []
    : _plugins?.before ?? []

  const afterPlugins = Array.isArray(_plugins) 
    ? _plugins
    : _plugins?.after ?? []

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

  const configOptions = {
    ...(config as Omit<TSRollupConfig, 'output'>),
    plugins
  } 

  const file = (output as RollupConfigOutput).file
  plugins.splice(beforePlugins.length, 0, 
      typescript2(createTSConfig({ input, tsconfig, file })))

  return createInputOptions({ config: configOptions, name })
}

export function _createTSRollupConfig(options: CreateRollupConfigOptions) { 
  const inputOptions = createTSRollupInputOptions(options) 
  const outputOptions = createOutputOptions(options)
  return ({ inputOptions, outputOptions }) as ConfigResult
}

export function createTSRollupConfigs(options: CreateRollupConfigOptions) {
  const config = options.config as TSRollupConfig

  const outputs = config.output as RollupConfigOutput[]
  const inputOptions = createInputOptions(options)

  const result: ConfigResult[] = outputs.map(output => ({
    inputOptions, 
    outputOptions: { ...createOutputOptions(options), ...output }
  }))

  return result
}