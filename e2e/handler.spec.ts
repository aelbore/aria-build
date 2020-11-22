import * as fs from 'fs'

import { expect } from 'aria-mocha'
import { BuildOptions, handler } from '../src'

describe('handler', () => {
  const tmpFolder = './node_modules/.tmp/dist/esbuild'
  const swcTmpFolder = './node_modules/.tmp/dist/swc'
  const dtsTmpFolder = './node_modules/.tmp/dist/dts'

  it('should build with default options esbuild enabled', async () => {
    const options: BuildOptions = {
      format: 'es,cjs',
      declaration: true,
      output: tmpFolder,
      watch: false,
      clean: tmpFolder,
      esbuild: true,
      write: true
    }

    await handler(options)

    expect(fs.existsSync(`./${tmpFolder}/aria-build.js`)).toBeTrue()
    expect(fs.existsSync(`./${tmpFolder}/aria-build.es.js`)).toBeTrue()
    expect(fs.existsSync(`./${tmpFolder}/package.json`)).toBeTrue()
    expect(fs.existsSync(`./${tmpFolder}/README.md`)).toBeTrue()

    const pkgFile = `./${tmpFolder}/package.json`
    const pkg = JSON.parse((await fs.promises.readFile(pkgFile, 'utf-8')))

    expect(pkg.name).equal('aria-build')
    expect(pkg.main).equal('aria-build.js')
    expect(pkg.module).equal('aria-build.es.js')
  })

  it('should build with default options swc enabled', async () => {
    const options: BuildOptions = {
      format: 'es,cjs',
      declaration: true,
      output: swcTmpFolder,
      watch: false,
      clean: swcTmpFolder,
      swc: true,
      write: true
    }

    await handler(options)

    expect(fs.existsSync(`./${swcTmpFolder}/aria-build.js`)).toBeTrue()
    expect(fs.existsSync(`./${swcTmpFolder}/aria-build.es.js`)).toBeTrue()
    expect(fs.existsSync(`./${swcTmpFolder}/package.json`)).toBeTrue()
    expect(fs.existsSync(`./${swcTmpFolder}/README.md`)).toBeTrue()

    const pkgFile = `./${swcTmpFolder}/package.json`
    const pkg = JSON.parse((await fs.promises.readFile(pkgFile, 'utf-8')))

    expect(pkg.name).equal('aria-build')
    expect(pkg.main).equal('aria-build.js')
    expect(pkg.module).equal('aria-build.es.js')
  })

  it('should build with dts-only', async () => {
    const options: BuildOptions = {
      format: 'es,cjs',
      declaration: false,
      output: dtsTmpFolder,
      watch: false,
      clean: dtsTmpFolder,
      esbuild: true,
      write: true,
      dtsOnly: true,
      config: './e2e/aria.config.ts'
    }

    await handler(options)

    expect(fs.existsSync(`./${dtsTmpFolder}/aria-build.js`)).toBeFalse()
    expect(fs.existsSync(`./${dtsTmpFolder}/aria-build.es.js`)).toBeFalse()
    expect(fs.existsSync(`./${dtsTmpFolder}/package.json`)).toBeTrue()
    expect(fs.existsSync(`./${dtsTmpFolder}/README.md`)).toBeTrue()
    expect(fs.existsSync(`./${dtsTmpFolder}/yarn.lock`)).toBeTrue()

    expect(fs.existsSync(`./${dtsTmpFolder}/aria-build.d.ts`)).toBeTrue()

    const pkgFile = `./${dtsTmpFolder}/package.json`
    const pkg = JSON.parse((await fs.promises.readFile(pkgFile, 'utf-8')))

    expect(pkg.name).equal('aria-build')
    expect(pkg.main).equal('')
  })

})