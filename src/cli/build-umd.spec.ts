import * as mockfs from 'mock-fs'

import { normalize } from 'path'
import { expect } from 'aria-mocha'

import { BuildFormatOptions } from './common'
import { buildUmd } from './build-umd'
import { RollupConfigOutput } from '../config/config'

describe('build-umd', () => {

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
      format: 'umd',
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

    const config = buildUmd(options)
    const output = config.output as RollupConfigOutput

    assertPath(config.input as string, `src/${options.pkgName}.ts`)
    assertPath(output.file, `./${options.output}/${options.pkgName}.js`)

    expect(output.format).equal(options.format)
    expect(output.sourcemap).toBeTrue()
    expect(config.external.length).equal(0)
  })

  it('should create config with entry file', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      entry: './src/entry-file.ts',
      output: 'dist',
      format: 'umd',
      sourcemap: true,
      external: 'react,vue'
    }

    mockfs({
      [`./src/${options.entry}.ts`]: ''
    })

    const config = buildUmd(options)
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

    const config = buildUmd(options)
    const output = config.output as RollupConfigOutput

    expect(config.input).equal(options.entry)
    expect(output.format).equal('umd')
    expect(output.file).equal('./dist/entry-file.umd.js')
  })

  it('should create config when compress is a string', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      output: 'dist',
      format: 'umd',
      sourcemap: true,
      compress: 'umd'
    }

    mockfs({
      [`./src/${options.pkgName}.ts`]: ''
    })

    const config = buildUmd(options)
    const output = config.output as RollupConfigOutput

    assertPath(config.input as string, `src/${options.pkgName}.ts`) 
    expect(output.format).equal('umd')
  })

  it('should create config when multiple format, external, globals, resolve is a string', () => {
    const options: BuildFormatOptions = {
      pkgName: 'sample-package',
      output: 'dist',
      format: 'umd,es',
      sourcemap: true,
      compress: true,
      resolve: 'react,vue',
      external: 'react',
      globals: 'react=react,vue=vue'
    }

    mockfs({
      [`./src/${options.pkgName}.ts`]: ''
    })

    const config = buildUmd(options)
    const output = config.output as RollupConfigOutput

    expect(config.external.length).equal(0)
    const globals = (function() {
      const globals = options.globals.split(',')
      /// @ts-ignore
      const entries = new Map(globals.map(global => global.split('=')))
      return Object.fromEntries(entries)
    })()
    Object.keys(globals).forEach(global => {
      expect(output.globals[global]).equal(globals[global])
    })
  })

})