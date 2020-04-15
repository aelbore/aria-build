import * as mockfs from 'mock-fs'
import { expect } from 'aria-mocha'

import { BuildFormatOptions } from './common'
import { buildUmd } from './build-umd'

describe('build-umd', () => {

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

    expect(config.input).equal(`src/${options.pkgName}.ts`)
    expect(config.output.format).equal(options.format)
    expect(config.output.file).equal(`./${options.output}/${options.pkgName}.js`)
    expect(config.output.sourcemap).toBeTrue()
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

    expect(config.input).equal(options.entry)
    expect(config.output.format).equal(options.format)
    expect(config.external.length).equal(2)
    expect(config.output.file).equal(`./dist/entry-file.js`)
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

    expect(config.input).equal(options.entry)
    expect(config.output.format).equal('umd')
    expect(config.output.file).equal('./dist/entry-file.umd.js')
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

    expect(config.input).equal(`src/${options.pkgName}.ts`)
    expect(config.output.format).equal('umd')
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

    expect(config.external.length).equal(0)
    const globals = (function() {
      const globals = options.globals.split(',')
      /// @ts-ignore
      const entries = new Map(globals.map(global => global.split('=')))
      return Object.fromEntries(entries)
    })()
    Object.keys(globals).forEach(global => {
      expect(config.output.globals[global]).equal(globals[global])
    })
  })

})