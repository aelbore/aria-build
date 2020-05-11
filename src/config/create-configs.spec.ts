import { expect, config } from 'aria-mocha'

import { CreateRollupConfigOptions } from './config'
import { createRollupConfigs } from './create-configs'
import { ConfigResult } from './base-config'

describe('create-configs', () => {

  function assertConfigPlugins(configs: ConfigResult[]) {
    configs.forEach(config => {
      const plugins = config.inputOptions.plugins as any[]
      const findIndex = name => plugins.findIndex(plugin => plugin.name.includes(name))

      expect(plugins.length).equal(3)
      expect(findIndex('esbuild')).equal(0)
      expect(findIndex('commonjs')).equal(1)
      expect(findIndex('node-resolve')).equal(2)
    })
  }

  it('should createRollupConfigs with multiple outputs', () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/index.ts',
        output: [
          {
            format: 'es',
            file: `dist/index.es.js`
          },
          {
            format: 'cjs',
            file: `dist/index.js`
          }
        ]
      },
      name: 'aria',
      esbuild: true
    }

    const configs = createRollupConfigs(options)
    assertConfigPlugins(configs)
  })

  it('should createRollupConfigs with output typeof object', () => {
    const options: CreateRollupConfigOptions = {
      config: {
        input: './src/index.ts',
        output: {
          sourcemap: true,
          format: 'es',
          file: `dist/index.es.js`
        }
      },
      name: 'aria',
      esbuild: true
    }

    const configs = createRollupConfigs(options)
    assertConfigPlugins(configs)
  })

})