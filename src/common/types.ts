 /* istanbul ignore file */

export interface PackageFile {
  filePath?: string
  entry?: string
  output?: string
  format?: string
  name?: string
  main?: string
  module?: string
  typings?: string
  dependencies?: KeyValue
  devDependencies?: KeyValue
  peerDependencies?: KeyValue
}

export interface KeyValue {
	[key: string]: string;
}

export type PluginOptions = any[] | PluginBeforeAfter

export interface PluginBeforeAfter {
	before?: any[]
	after?: any[]
}

export interface CreateRollupConfigOptions {
  config: RollupConfigBase | TSRollupConfig | RollupConfigBase[] | TSRollupConfig[]
  name?: string
  esbuild?: boolean
  swc?: boolean
  write?: boolean
}

export interface OutputOptions extends RollupConfigOutput {  }

export interface RollupConfigBase {
  input?: string | string[]
  external?: string[]
  plugins?: PluginOptions
  output?: RollupConfigOutput | RollupConfigOutput[]
  resolveOpts?: NodeResolveOptions
  commonOpts?: CommonJsOptions
  replace?: KeyValue
  compress?: boolean
  watch?: import('../libs').WatcherOptions
  hmr?: boolean
}

export interface TSRollupConfig extends RollupConfigBase  {
  tsconfig?: TSConfigOptions
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
  format?: import('../libs').ModuleFormat
  name?: string
  exports?: string
  globals?: KeyValue
  plugins?: PluginOptions
}

export interface TSConfigOptions {
  compilerOptions?: import('typescript').CompilerOptions,
  transformers?: import('typescript').CustomTransformers,
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
    compilerOptions?: Omit<import('typescript').CompilerOptions, 'module' | 'moduleResolution' | 'target'>
    exclude?: string[]
    include?: string[]
  },
  transformers?: any[]
  check?: boolean
  objectHashIgnoreUnknownHack?: boolean
  useTsconfigDeclarationDir?: boolean
  cacheRoot?: string
}