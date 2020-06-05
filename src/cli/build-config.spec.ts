import * as mockfs from 'mock-fs'
import * as mock from 'mock-require'

import { normalize } from 'path'
import { expect } from 'aria-mocha'

import { TSRollupConfig, RollupConfigOutput } from '../common/common'
import { buildConfig } from './build-config' 
import { BuildFormatOptions } from './common'

describe('buildConfig', () => {

  function assertOutput(config: TSRollupConfig, expected: TSRollupConfig) {
    const outputs = config.output as RollupConfigOutput[]
    expect((config.output as RollupConfigOutput[]).length)
      .equal((expected.output as RollupConfigOutput[]).length)
    outputs.forEach(output => {
      const value = (expected.output as RollupConfigOutput[])
        .find(result => result.format.includes(output.format))

      expect(value.sourcemap).equal(output.sourcemap)
      expect(value.format).equal(output.format)
      expect(normalize(value.file)).equal(normalize(output.file))

      if (output.format.includes('umd')) {
        expect(value.name).equal(output.name)
        expect(value.hasOwnProperty('globals')).toBeTrue()
      }
    })
  }

  before(() => {
    mock('rollup-plugin-terser', { terser() {} })
  })

  afterEach(() => {
    mockfs.restore()
  })

  it('should build config with multiple output', () => {
    mockfs({
      './src/index.ts': ''
    })

    const options: BuildFormatOptions = {
      format: 'es,cjs',
      declaration: false,
      sourcemap: false,
      clean: 'dist',
      output: 'dist',
      watch: false,
      pkgName: 'custom-package'
    }

    const expected: TSRollupConfig = {
      input: 'src/index.ts',
      plugins: [],
      external: [],
      output: [
        {
          sourcemap: false,
          format: 'es',
          file: `dist/${options.pkgName}.es.js`
        },
        {
          sourcemap: false,
          format: 'cjs',
          file: `dist/${options.pkgName}.js`
        }
      ],
      tsconfig: {
        compilerOptions: {
          declaration: false
        }
      }
    }

    const config = buildConfig(options)

    expect(normalize(config.input as string)).equal(normalize(expected.input as string))
    expect((config.plugins as any[]).length).equal((expected.plugins as any[]).length)
    expect(config.external.length).equal(config.external.length)
    expect(config.tsconfig.compilerOptions.declaration).equal(false)
    
    assertOutput(config, expected)
  })

  it('should build config with multiple output, has entry,plugins and no declaration,sourcemap, compress', () => {
    mockfs({
      './src/index.ts': ''
    })

    const options: BuildFormatOptions = {
      format: 'es,cjs',
      clean: 'dist',
      output: 'dist',
      watch: false,
      entry: './src/index.ts',
      plugins: [],
      compress: true
    }

    const expected: TSRollupConfig = {
      output: [
        {
          sourcemap: false,
          format: 'es',
          file: `dist/index.es.js`
        },
        {
          sourcemap: false,
          format: 'cjs',
          file: `dist/index.js`
        }
      ]
    }

    const config = buildConfig(options)

    assertOutput(config, expected)
  })

  it('should build config with multiple output format: es,umd compress umd format', () => {
    mockfs({
      './src/index.ts': ''
    })

    const options: BuildFormatOptions = {
      format: 'es,umd',
      declaration: false,
      sourcemap: false,
      clean: 'dist',
      output: 'dist',
      watch: false,
      name: 'umdName',
      resolve: 'react,vue',
      external: 'react',
      globals: 'react=react,vue=vue',
      pkgName: 'custom-package',
      compress: 'umd'
    }

    const expected: TSRollupConfig = {
      output: [
        {
          sourcemap: false,
          format: 'es',
          file: `dist/${options.pkgName}.js`
        },
        {
          sourcemap: false,
          format: 'umd',
          file: `dist/${options.pkgName}.umd.js`,
          name: 'umdName',
          globals: {
            'vue': 'vue'
          }
        }
      ]
    }

    const config = buildConfig(options)

    assertOutput(config, expected)
  })

  it('should build config with multiple output format: es,cjs,umd', () => {
    mockfs({
      './src/index.ts': ''
    })

    const options: BuildFormatOptions = {
      format: 'es,cjs,umd',
      declaration: true,
      sourcemap: true,
      clean: 'dist',
      output: 'dist',
      watch: false,
      name: 'umdName',
      pkgName: 'custom-package'
    }

    const expected: TSRollupConfig = {
      output: [
        {
          sourcemap: true,
          format: 'es',
          file: `dist/${options.pkgName}.es.js`
        },
        {
          sourcemap: true,
          format: 'cjs',
          file: `dist/${options.pkgName}.js`
        },
        {
          sourcemap: true,
          format: 'umd',
          file: `dist/${options.pkgName}.umd.js`,
          name: 'umdName',
          globals: {
            'vue': 'vue'
          }
        }
      ]
    }

    const config = buildConfig(options)
    
    assertOutput(config, expected)
  })

})