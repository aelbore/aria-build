/* istanbul ignore file */

import { hmrPlugin, watch as rollupWatch } from '../libs'
import { CreateRollupConfigOptions, _createTSRollupConfig } from '../config/config'

import { rollupBuild } from './build'

export async function hmrBuild(options: CreateRollupConfigOptions) {
  const { inputOptions, outputOptions } = _createTSRollupConfig(options)
  await rollupBuild({ inputOptions, outputOptions })
  
  const { input, plugins, watch } = inputOptions
  const { sourcemap, file, format } = outputOptions

  rollupWatch({
    input,
    plugins: [
      ...(plugins as any[]),
      hmrPlugin({
        public: 'public',
        clearConsole: false,
        write: true
      })
    ],
    watch,
    output: {
      sourcemap,
      file,
      format
    }
  })
}