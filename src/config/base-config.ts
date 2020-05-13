import { join } from 'path'

import { getPackageNameSync, DEFAULT_VALUES, DEFAULT_DEST } from '../common/common'
import { terser, multiEntry, replacePlugin } from '../libs'

import { TSRollupConfig, RollupConfigBase, RollupConfigOutput } from './common'

export interface CreateRollupConfigOptions {
  config: RollupConfigBase | TSRollupConfig | RollupConfigBase[] | TSRollupConfig[]
  name?: string
  esbuild?: boolean
}

export interface InputOptions extends Pick<RollupConfigBase, 'external' | 'plugins' | 'input' | 'watch'> {
  onwarn(options: { code: string, message: string }): void
}

export interface OutputOptions extends RollupConfigOutput { 
}

export interface ConfigResult {
  inputOptions?: InputOptions
  outputOptions?: OutputOptions
}

export function onwarn(options: { code: string, message: string }) {
  !options.code.includes('THIS_IS_UNDEFINED') 
    && console.log('Rollup warning: ', options.message)
}

export function createInputOptions(options: CreateRollupConfigOptions) {
  const { input, compress, replace, watch } = options.config as RollupConfigBase

  const plugins = ((options.config as RollupConfigBase).plugins ?? []) as any[]
  const external = (options.config as RollupConfigBase).external ?? []

  const minify = () => terser({
    output: { comments: false }
  })

  replace 
    && (Object.keys(replace).length > 0)
    && (plugins.unshift(replacePlugin(replace)))

  const inputOptions: InputOptions = {
    input,
    external: [
      ...external,
      ...DEFAULT_VALUES.ROLLUP_EXTERNALS
    ],
    plugins: [
      ...(Array.isArray(input) ? [ multiEntry() ]: []),
      ...plugins,
      ...(compress ? [ minify() ]: [])
    ],
    onwarn,
    watch: {
      clearScreen: false,
      ...(watch ?? {})
    }
  }

  return inputOptions
}

export function createOutputOptions(options: CreateRollupConfigOptions) {
  const output = (options.config as RollupConfigBase).output as RollupConfigOutput
  const name = options.name ?? getPackageNameSync()
  const file = output?.file ?? join(DEFAULT_DEST, `${name}.js`)

  const outputOptions: OutputOptions = {
    sourcemap: false,
    format: 'es',
    exports: 'named',
    globals: {},
    ...(output ?? {}),
    file
  }

  return outputOptions
}

export function createRollupConfig(options: CreateRollupConfigOptions) {
  const inputOptions = createInputOptions(options)
  const outputOptions = createOutputOptions(options)
  return ({ inputOptions, outputOptions }) as ConfigResult
}