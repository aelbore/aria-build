import * as mockfs from 'mock-fs'
import { expect } from 'aria-mocha'

import { BuildFormatOptions } from './common'
import { buildES } from './build-es'

describe('build-es', () => {

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

    expect(config.input).equal(`src/${options.pkgName}.ts`)
    expect(config.output.format).equal(options.format)
    expect(config.output.file).equal(`./${options.output}/${options.pkgName}.js`)
    expect(config.output.sourcemap).toBeTrue()
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

    const config = buildES(options)

    expect(config.input).equal(options.entry)
    expect(config.output.format).equal('es')
    expect(config.output.file).equal('./dist/entry-file.es.js')
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

    expect(config.input).equal(`src/${options.pkgName}.ts`)
    expect(config.output.format).equal('es')
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