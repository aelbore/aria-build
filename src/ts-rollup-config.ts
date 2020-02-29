import { basename, join } from 'path'
import { commonjs, nodeResolve, typescript2 } from './libs'
import { getPackageName, DEFAULT_VALUES, baseDir } from './utils'
import { PluginOptions } from './cli-common'
import { RollupConfigBase, createRollupConfig, NodeResolveOptions, CommonJsOptions } from './base-rollup-config'
import { CustomTransformer, CompilerOptions } from 'typescript'

export interface TSConfigOptions {
  compilerOptions?: CompilerOptions,
  transformers?: CustomTransformer,
  exclude?: string[]
}

export interface TSRollupConfig extends Omit<RollupConfigBase, 'plugins'>  {
  plugins?: PluginOptions
  tsconfig?: TSConfigOptions
}

export function createTSConfig(options: { 
  input?: string | string[], 
  file?: string, 
  tsconfig?: any, 
  pluginOptions?: any 
} = {}) { 
  const { input, file, tsconfig, pluginOptions } = options

  const transformers = tsconfig?.transformers ?? []
  const compilerOptions = tsconfig?.compilerOptions ?? {}
  const outputFile = file ? basename(file): '.rts2_cache'
  const include = input ? { include: Array.isArray(input) ? input: [ input ] }: {}

  return {
    transformers: [ 
      () => ({
        before: [ ...transformers  ],
        after: []
      })
    ],
    tsconfigDefaults: {
      compilerOptions: {
        baseUrl: '.',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        declaration: false,
        module: 'es2015',
        moduleResolution: 'node',
        allowJs: true,
        target: 'es2018',
        lib: [ 
          "dom", 
          "es2015", 
          "es2017"  
        ],
        ...compilerOptions
      },
      ...include,
      ...(tsconfig?.exclude ? { exclude: tsconfig.exclude }: {})
    },
    check: false,
    objectHashIgnoreUnknownHack: false,
    cacheRoot: join(baseDir(), 'node_modules/.tmp', outputFile), 
    /// compilerOptions.declation = true
    /// create dts files
    /// useTsconfigDeclarationDir === false and compilerOptions.declation = true
    /// create dts files
    useTsconfigDeclarationDir: !compilerOptions?.declaration ?? true,    
    ...(pluginOptions || {})
  }
}

export function createTSPlugin({
  input,
  file,
  tsconfig
}) {
  return typescript2(createTSConfig({ 
    input, 
    file, 
    tsconfig 
  }))
}

export function createTSRollupConfig(options: TSRollupConfig) {
  const { input, output, external, tsconfig, resolve, commonOpts, compress } = options

  const entry = Array.isArray(input) ? input: [ input ]

  const file = output?.file 
    ? join(baseDir(), output.file)
    : join(DEFAULT_VALUES.DIST_FOLDER, getPackageName() + '.js')

  const beforePlugins = Array.isArray(options.plugins)
    ? []
    : (options.plugins?.before ?? [])

  const afterPlugins = Array.isArray(options.plugins) 
    ? (options.plugins || [])
    : (options.plugins?.after ?? [])

  const plugins = [ 
    ...beforePlugins, 
    createTSPlugin({ 
      input: entry, 
      file, 
      tsconfig 
    }),
    commonjs({
      ...(commonOpts ?? {})
    }),
    nodeResolve({ 
      ...(resolve ?? {}) 
    }),
    ...afterPlugins 
  ]

  return createRollupConfig({
    input,
    output,
    external,
    compress,
    plugins
  })
}