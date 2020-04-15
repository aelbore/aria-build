import * as fs from 'fs'
import * as mockfs from 'mock-fs'
import * as sinon from 'sinon'

import { expect } from 'aria-mocha'
import { moveDtsFiles, MoveDtsOptions } from './move-dts'
import { readFile } from '../fs/fs'

describe('move-dts', () => {
  let sanbox: sinon.SinonSandbox, getPackage: any
  
  before(async () => {
    getPackage = await import('./get-package')
    sanbox = sinon.createSandbox()
    sinon
      .stub(getPackage, 'getPackageName')
      .returns(Promise.resolve('custom-move-dts'))
  })

  afterEach(() => {
    mockfs.restore()
    sanbox.restore()
    sinon.restore()
  })

  it('should moveDtsFiles when options is null or empty', async () => {
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

    const files = [
      './dist/src/cli/run.d.ts',
      './dist/src/cli/index.d.ts',
      './dist/src/fs/fs.d.ts',
      './dist/src/fs/index.d.ts',
      './dist/src/cli.d.ts',
      './dist/src/fs.d.ts',
      './dist/src/index.d.ts'
    ]
    
    await moveDtsFiles()
    await Promise.all([
      Promise.all(files.map(file => {
        expect(fs.existsSync(file)).toBeTrue()
      })),
      Promise.all(files.map(file => {
        const oldFile = file.replace('src/', '')
        expect(fs.existsSync(oldFile)).toBeFalse()
      }))
    ])
    expect(fs.existsSync('./dist/custom-move-dts.d.ts')).toBeTrue()
  })

  it('should moveDtsFiles when options has output', async () => {
    const options: MoveDtsOptions = {
      output: 'custom'
    }

    mockfs({
      [options.output]: {
        'file.d.ts': ''
      }
    })

    await moveDtsFiles(options)
  })

  it('should moveDtsFiles when has optios.entry with multiple d.ts', async () => {
    const options: MoveDtsOptions = {
      entry: './src/input.ts'
    }

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

    await moveDtsFiles(options)
    expect(fs.existsSync('./dist/input.d.ts')).toBeTrue()
  })

  it('should moveDtsFiles when has optios.name with multiple d.ts (subfolders)', async () => {
    const options: MoveDtsOptions = {
      name: 'move-dts'
    }

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
        'fs.d.ts': ''
      }
    })

    await moveDtsFiles(options)
    expect(fs.existsSync('./dist/move-dts.d.ts')).toBeTrue()
  })

  it('should moveDtsFiles when have default options', async () => {

    mockfs({
      'dist': {
        'clean.d.ts': '',
        'copy.d.ts': '',
        'glob.d.ts': '',
        'custom-move-dts.d.ts': '',
        'mkdirp.d.ts': '',
        'symlink.d.ts': ''
      }
    })

    await moveDtsFiles({ name: 'custom-move-dts' })
    
    const content = await readFile('./dist/custom-move-dts.d.ts', 'utf-8')
    expect(content).equal(`export * from './src/custom-move-dts'`)
  })

})