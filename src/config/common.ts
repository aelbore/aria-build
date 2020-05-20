import { PluginOptions, KeyValue } from '../common/common'
import { WatcherOptions, ModuleFormat } from '../libs'
import { CompilerOptions, CustomTransformers } from 'typescript'

export interface RollupConfigBase {
  input?: string | string[]
  external?: string[]
  plugins?: PluginOptions
  output?: RollupConfigOutput | RollupConfigOutput[]
  resolveOpts?: NodeResolveOptions
  commonOpts?: CommonJsOptions
  replace?: KeyValue
  compress?: boolean
  watch?: WatcherOptions
  hmr?: boolean
}

export interface TSRollupConfig extends RollupConfigBase  {
  tsconfig?: TSConfigOptions
  ts?: boolean
}

export interface NodeResolveOptions {
  extensions?: string[]
  mainFields?: string[]
}

export interface CommonJsOptions {
  extensions?: string[]
  include?: string | string[]
  exclude?: string | string[]
}

export interface RollupConfigOutput {
  sourcemap?: boolean | 'inline' | 'hidden'
  file?: string
  format?: ModuleFormat
  name?: string
  exports?: string
  globals?: KeyValue
  plugins?: PluginOptions
}

export interface TSConfigOptions {
  compilerOptions?: CompilerOptions,
  transformers?: CustomTransformers,
  exclude?: string[]
  include?: string[]
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