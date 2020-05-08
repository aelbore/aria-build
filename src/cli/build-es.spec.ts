import * as mockfs from 'mock-fs'

import { normalize } from 'path'
import { expect } from 'aria-mocha'

import { BuildFormatOptions } from './common'
import { buildES } from './build-es'
import { RollupConfigOutput } from '../config/config'

describe('build-es', () => {

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
      format: 'es',
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

    const config = buildES(options)
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
      format: 'es',
      sourcemap: true,
      external: 'react,vue'
    }

    mockfs({
      [`./src/${options.entry}.ts`]: ''
    })

    const config = buildES(options)
    const output = config.output as RollupConfigOutput

    expect(config.input).equal(options.entry)
    expect(output.format).equal(options.format)
    expect(config.external.length).equal(2)
    expect(output.file).equal(`./dist/entry-file.js`)
  })

  it('should create config with entry file with multiple format', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      entry: './src/entry-file.ts',
      output: 'dist',
      format: 'es,umd',
      sourcemap: true,
      external: 'react,vue'
    }

    mockfs({
      [`./src/${options.entry}.ts`]: ''
    })

    const config = buildES(options)
    const output = config.output as RollupConfigOutput

    expect(config.input).equal(options.entry)
    expect(output.format).equal('es')
    expect(output.file).equal('./dist/entry-file.es.js')
  })

  it('should create config when compress is a string', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      output: 'dist',
      format: 'es',
      sourcemap: true,
      compress: 'es'
    }

    mockfs({
      [`./src/${options.pkgName}.ts`]: ''
    })

    const config = buildES(options)
    const output = config.output as RollupConfigOutput

    assertPath(config.input as string, `src/${options.pkgName}.ts`)
    expect(output.format).equal('es')
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

    const config = buildES(options)

    expect(config.tsconfig.compilerOptions.declaration).toBeFalse()
    expect(config.external.length).equal(0)
  })

})