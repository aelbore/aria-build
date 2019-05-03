import * as path from 'path'

import { commonjs, nodeResolve, typescript2 } from './libs'
import { getPackageName, DEFAULT_VALUES } from './utils'

function onwarn(warning) {
  if (warning.code === 'THIS_IS_UNDEFINED') { return; }
  console.log("Rollup warning: ", warning.message);
}

function createTSConfig({ input, tsconfig }) { 
  const transformers = ((tsconfig && tsconfig.transformers) 
    ? tsconfig.transformers: []) 

  const compilerOptions = ((tsconfig && tsconfig.compilerOptions) 
    ? tsconfig.compilerOptions: {})

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
      include: [ input ],
    },
    check: false,
    cacheRoot: path.join(path.resolve(), 'node_modules/.tmp/.rts2_cache'), 
    /// compilerOptions.declation = true
    /// create dts files
    /// useTsconfigDeclarationDir === false and compilerOptions.declation = true
    /// create dts files
    useTsconfigDeclarationDir: (compilerOptions ? !compilerOptions.declaration: true)
  }
}

export interface TSRollupConfig {
  input: string;
  external?: string[];
  output?: {
    sourcemap?: boolean,
    file?: string,
    format?: string,
    name?: string,
    exports?: string,
    global?: any
  };
  plugins?: any[];
  tsconfig?: {
    compilerOptions?: any,
    transformers?: any[]
  }
}

export function createTSRollupConfig(options: TSRollupConfig) {
  const { input, output, external, tsconfig, plugins } = options
  return {
    inputOptions: {
      input,
      external: [
        ...DEFAULT_VALUES.ROLLUP_EXTERNALS,
        ...(external || [])
      ],
      treeshake: true,
      plugins: [
        ...(plugins || []),
        typescript2(createTSConfig({ input, tsconfig })),
        commonjs(),
        nodeResolve()
      ],
      onwarn: onwarn
    },
    outputOptions: {
        sourcemap: false,
        format: 'es',
        exports: 'named',
        global: {},
        file: path.join(DEFAULT_VALUES.DIST_FOLDER, getPackageName() + '.js', ),
      ...(output || {})
    }
  }
}