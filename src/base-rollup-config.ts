import { join } from 'path'
import { baseDir, getPackageName, DEFAULT_VALUES } from './utils'
import { terser, multiEntry, replacePlugin } from './libs'
import { KeyValue } from './cli-common'

export interface NodeResolveOptions {
  extensions?: string[]
  mainFields?: string[]
}

export interface CommonJsOptions {
  extensions?: string[]
  include?: string | string[]
  exclude?: string | string[]
}

export function onwarn(warning: { code: string, message: string }) {
  if (warning.code === 'THIS_IS_UNDEFINED') { return; }
  console.log("Rollup warning: ", warning.message);
}

export interface RollupConfigBase {
  input: string | string[]
  external?: string[]
  output?: {
    sourcemap?: boolean | string,
    file?: string,
    format?: string,
    name?: string,
    exports?: string,
    globals?: KeyValue
  };
  plugins?: any[]
  compress?: boolean
  resolve?: NodeResolveOptions
  commonOpts?: CommonJsOptions,
  replace?: KeyValue
}

export function createRollupConfig(options: RollupConfigBase) {
  const { input, output, external, plugins, compress } = options
  
  const file = output?.file 
    ? join(baseDir(), output.file)
    : join(DEFAULT_VALUES.DIST_FOLDER, getPackageName() + '.js')

  const minify = () => terser({
    output: { comments: false }
  })

  if (options?.replace 
    && (Object.keys(options.replace).length > 0)
    && Array.isArray(plugins) ) {
    plugins.unshift(replacePlugin(options.replace))
  }

  return {
    inputOptions: {
      input,
      external: [
        ...DEFAULT_VALUES.ROLLUP_EXTERNALS,
        ...(external || [])
      ],
      treeshake: true,
      plugins: [
        ...(Array.isArray(input) ? [ multiEntry() ]: []),
        ...(plugins ?? []),
        ...(compress ? [ minify() ]: [])
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