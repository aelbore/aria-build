import * as mockfs from 'mock-fs'
import { normalize } from 'path'
import { expect } from 'aria-mocha'

import { BuildFormatOptions } from './common'
import { buildCommonJS } from './build-cjs'
import { RollupConfigOutput } from '../config/config'

describe('build-cjs', () => {

  function assertPath(actual: string, expected: string) {
    expect(normalize(actual)).equal(normalize(expected))
  }

  afterEach(() => {
    mockfs.restore()
  })

  it('should create config', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      output: 'dist',
      format: 'cjs',
      sourcemap: true,
      compress: true,
      declaration: true,
      dependencies: [ '@angular/core' ],
      external: 'react,vue',
      resolve: true
    }

    mockfs({
      [`./src/${options.pkgName}.ts`]: ''
    })

    const config = buildCommonJS(options)
    const output = config.output as RollupConfigOutput

    assertPath(config.input as string, `src/${options.pkgName}.ts`)
    assertPath(output.file, `./${options.output}/${options.pkgName}.js`)

    expect(output.format).equal(options.format)
    expect(output.sourcemap).toBeTrue()
    expect(config.tsconfig.compilerOptions.declaration).equal(options.declaration)
    expect(config.external.length).equal(0)
  })

  it('should create config with entry file', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      entry: './src/entry-file.ts',
      output: 'dist',
      format: 'cjs',
      sourcemap: true,
      external: 'react,vue'
    }

    mockfs({
      [`./src/${options.entry}.ts`]: ''
    })

    const config = buildCommonJS(options)
    const output = config.output as RollupConfigOutput

    expect(config.input).equal(options.entry)
    expect(config.external.length).equal(2)
    expect(output.file).equal(`./dist/entry-file.js`)
  })

  it('should create config when compress is a string', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      output: 'dist',
      format: 'cjs',
      sourcemap: true,
      compress: 'cjs'
    }

    mockfs({
      [`./src/${options.pkgName}.ts`]: ''
    })

    const config = buildCommonJS(options)
    const output = config.output as RollupConfigOutput

    assertPath(config.input as string, `src/${options.pkgName}.ts`)
    assertPath(output.file, `./${options.output}/${options.pkgName}.js`)
    
    expect(output.sourcemap).toBeTrue()
    expect(config.compress).toBeTrue()
    expect(config.external.length).equal(0)
  })

  it('should create config when multiple format, external, resolve is a string', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      output: 'dist',
      format: 'cjs,es',
      sourcemap: true,
      compress: true,
      resolve: 'react,vue',
      external: 'react'
    }

    mockfs({
      [`./src/${options.pkgName}.ts`]: ''
    })

    const config = buildCommonJS(options)

    expect(config.tsconfig).toBeUndefined()
    expect(config.external.length).equal(0)
  })

})