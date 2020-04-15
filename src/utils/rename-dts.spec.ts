import * as fs from 'fs'
import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'

import { expect } from 'aria-mocha'

import { TSRollupConfig } from '../config/config'
import { renameDtsEntryFile } from './rename-dts'

describe('rename-dts', () => {
  let sanbox: sinon.SinonSandbox, getPackage: any

  before(async() => {
    getPackage = await import('./get-package')
    sanbox = sinon.createSandbox()
    sanbox
      .stub(getPackage, 'getPackageName')
      .returns(Promise.resolve('rename-dts'))
  })

  after(() => {
    sanbox.restore()
    sinon.restore()
  })

  afterEach(() => {
    mockfs.restore()
  })

  it('should renameDtsEntryFile when options is an array', async () => {
    const config: TSRollupConfig[] = [
      { input: './src/input.ts' },
      { input: './src/input.ts' }
    ]

    await renameDtsEntryFile({ config })
  })

  it('should renameDtsEntryFile when options is an object', async () => {
    
    const config: TSRollupConfig = {
      input: './src/index.ts',
      output: {
        file: './dist/rename-dts.js'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

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

    await renameDtsEntryFile({ config })

    expect(fs.existsSync('./dist/rename-dts.d.ts')).toBeTrue()
    expect(fs.existsSync('./dist/index.d.ts')).toBeFalse()
  })

  it('should renameDtsEntryFile when has options.entry', async () => {

    const config: TSRollupConfig = {
      input: './src/index.ts',
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mockfs({
      'dist': {
        'custom-entry.d.ts': ''
      }
    })

    const fsModule = await import('../fs/fs-promises')
    const renameSpy = sinon.spy(fsModule, 'rename')

    await renameDtsEntryFile({ config, entry: './src/custom-entry.ts' })
    expect(renameSpy.called).toBeFalse()
  })

  it('should renameDtsEntryFile when has options.name and has multiple input', async () => {

    const config: TSRollupConfig = {
      input: [ './src/input.ts', './src/fs.ts' ],
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mockfs({
      'dist': {
        'input.d.ts': '',
        'fs.d.ts': ''
      }
    })

    await renameDtsEntryFile({ config, name: 'rename-dts' })
    expect(fs.existsSync('./dist/rename-dts.d.ts')).toBeTrue()
  })

  it('should renameDtsEntryFile when has multiple input', async () => {

    const config: TSRollupConfig = {
      input: [ './src/input.ts', './src/fs.ts' ],
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mockfs({
      'dist': {
        'input.d.ts': '',
        'fs.d.ts': ''
      }
    })

    await renameDtsEntryFile({ config })
    expect(fs.existsSync('./dist/rename-dts.d.ts')).toBeTrue()
  })

})