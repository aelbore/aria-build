import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'
import * as fs from 'fs'

import { expect } from 'aria-mocha'

import { TSRollupConfig } from '../config/config'
import { readFile } from '../fs/fs'

import { renameDtsEntryFile } from './rename-dts'
import { moveDtsFiles } from './move-dts'

describe('rename-move-dts', () => {
  let sanbox: sinon.SinonSandbox
  let getPackage: any
  const pkg = { 
    name: 'rename-move-dts' 
  }

  before(async () => {
    getPackage = await import('./get-package')
    sanbox = sinon.createSandbox()
    sanbox
      .stub(getPackage, 'getPackageName')
      .returns(Promise.resolve(pkg.name))
  })

  after(() => {
    sanbox.restore()
    sinon.restore()
  })

  afterEach(() => {
    mockfs.restore()
  })

  it('should rename-move-dts default options', async () => {
    mockfs({
      'dist': {
        'clean.d.ts': '',
        'copy.d.ts': '',
        'glob.d.ts': '',
        'index.d.ts': '',
        'mkdirp.d.ts': '',
        'symlink.d.ts': ''
      }
    })

    const config: TSRollupConfig = {
      input: './src/index.ts',
      output: {
        file: './dist/rename-move-dts.js'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    const expected = [
      './dist/src/clean.d.ts',
      './dist/src/copy.d.ts',
      './dist/src/glob.d.ts',
      './dist/src/rename-move-dts.d.ts',
      './dist/src/mkdirp.d.ts',
      './dist/src/symlink.d.ts',
      './dist/rename-move-dts.d.ts'
    ]

    await renameDtsEntryFile({ config, ...pkg })
    await moveDtsFiles({ ...pkg })
    
    await Promise.all(expected.map(file => {
      expect(fs.existsSync(file)).toBeTrue()
    }))
    const content = await readFile(`./dist/${pkg.name}.d.ts`, 'utf-8')
    expect(content).equal(`export * from './src/${pkg.name}'`)
  })

  it('should rename-move-dts default options with subfolders', async () => {

    mockfs({
      'dist': {
        'cli': {
          'run.d.ts': '',
          'index.d.ts': ''
        },
        'fs': {
          'fs.d.ts': '',
          'index.d.ts': ''
        },
        'cli.d.ts': '',
        'fs.d.ts': '',
        'index.d.ts': ''
      }
    })

    const config: TSRollupConfig = {
      input: './src/index.ts',
      output: {
        file: './dist/rename-move-dts.js'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    const files = [
      './dist/src/cli/run.d.ts',
      './dist/src/cli/index.d.ts',
      './dist/src/fs/fs.d.ts',
      './dist/src/fs/index.d.ts',
      './dist/src/cli.d.ts',
      './dist/src/fs.d.ts',
      './dist/src/rename-move-dts.d.ts'
    ]

    await renameDtsEntryFile({ config, ...pkg })
    await moveDtsFiles({ ...pkg })

    await Promise.all(files.map(file => {
      expect(fs.existsSync(file)).toBeTrue()
    }))
    expect(fs.existsSync(`./dist/${pkg.name}.d.ts`)).toBeTrue()

    const content = await readFile(`./dist/${pkg.name}.d.ts`, 'utf-8')
    expect(content).equal(`export * from './src/${pkg.name}'`)
  })

})