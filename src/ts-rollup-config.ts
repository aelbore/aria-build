import { basename, join } from 'path'
import { commonjs, nodeResolve, typescript2, multiEntry } from './libs'
import { getPackageName, DEFAULT_VALUES, baseDir } from './utils'

export function onwarn(warning) {
  if (warning.code === 'THIS_IS_UNDEFINED') { return; }
  console.log("Rollup warning: ", warning.message);
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
    objectHashIgnoreUnknownHack: true,
    cacheRoot: join(baseDir(), 'node_modules/.tmp', outputFile), 
    /// compilerOptions.declation = true
    /// create dts files
    /// useTsconfigDeclarationDir === false and compilerOptions.declation = true
    /// create dts files
    useTsconfigDeclarationDir: !compilerOptions?.declaration ?? true,    
    ...(pluginOptions || {})
  }
}

export interface TSRollupConfig {
  input: string | string[];
  external?: string[];
  output?: {
    sourcemap?: boolean,
    file?: string,
    format?: string,
    name?: string,
    exports?: string,
    globals?: any
  };
  plugins?: any[] | { before?: any[], after?: any[] };
  tsconfig?: {
    compilerOptions?: any,
    transformers?: any[],
    exclude?: string[]
  }
}

export function createTSRollupConfig(options: TSRollupConfig) {
  const { input, output, external, tsconfig, plugins } = options
  
  const file = output?.file 
    ? join(baseDir(), output.file)
    : join(DEFAULT_VALUES.DIST_FOLDER, getPackageName() + '.js')

  const entry = Array.isArray(input) ? input: [ input ]

  const beforePlugins = Array.isArray(plugins)
    ? []
    : (plugins?.before ?? [])

  const afterPlugins = Array.isArray(plugins) 
    ? (plugins || [])
    : (plugins?.after ?? [])

  return {
    inputOptions: {
      input: entry,
      external: [
        ...DEFAULT_VALUES.ROLLUP_EXTERNALS,
        ...(external || [])
      ],
      treeshake: true,
      plugins: [
        ...beforePlugins,
        multiEntry(),
        typescript2(createTSConfig({ 
          input: entry, 
          file, 
          tsconfig 
        })),
        commonjs(),
        nodeResolve(),
        ...afterPlugins,
      ],
      onwarn
    },
    outputOptions: {
      sourcemap: false,
      format: 'es',
      exports: 'named',
      globals: {},
      ...(output || {}),
      file
    }
  }
}