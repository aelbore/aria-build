import * as fs from 'fs'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { copyReadMeFile, CopyReadmeOptions } from './copy-readme'

describe('copy-readme', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should copy existing readme file when options is empty or null', async () => {

    mockfs({
      'dist': {},
      'README.md': ''
    })

    await copyReadMeFile()
    expect(fs.existsSync('./dist/README.md')).toBeTrue()
  })

  it('should copy existing readme file when options is not empty or null', async () => {
    const options: CopyReadmeOptions = {
      filePath: './src/README.md',
      output: './build'
    }

    mockfs({
      [options.output]: {},
      [options.filePath]: ''
    })

    await copyReadMeFile(options)
    expect(fs.existsSync('./build/README.md')).toBeTrue()
  })

  it('should not copy readme file when not exist', async () => {
    mockfs({
      'dist': {}
    })
  
    await copyReadMeFile()
    expect(fs.existsSync('./dist/README.md')).toBeFalse()
  })

})