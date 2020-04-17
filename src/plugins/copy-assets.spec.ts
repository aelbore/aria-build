import * as mockfs from 'mock-fs'

import { existsSync } from 'fs'
import { readFile } from '../fs/fs'
import { expect, globFiles } from 'aria-mocha'
import { copyAssets, replaceContent } from './copy-assets'

describe('copyAssets', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should copy files', async () => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': ''
      }
    })

    await copyAssets({ 
      targets: [
        { src: './public/*', dest: 'dist' }
      ]
    })

    expect(existsSync('./dist/index.html')).toBeTrue()
    expect(existsSync('./dist/styles.css')).toBeTrue()
  })

  it('should copy files with existing files', async () => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': ''
      }
    })
    
    await Promise.all([
      copyAssets({ 
        targets: [
          { src: './public/*', dest: 'dist' }
        ]
      }),
      copyAssets({ 
        targets: [
          { src: './public/*', dest: 'dist' }
        ]
      })
    ])

    expect(existsSync('./dist/index.html')).toBeTrue()
    expect(existsSync('./dist/styles.css')).toBeTrue()
  })

  it('should copy files with target.replace', async () => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': '',
        'index.js': '../src'
      }
    })

    function replace(filename: string) {
      return replaceContent({ 
        filename, 
        strToFind: '../src',  
        strToReplace: '../aria-build' 
      })
    }

    await copyAssets({ 
      targets: [
        { src: './public/*', dest: 'dist', replace }
      ]
    })

    expect(existsSync('./dist/index.html')).toBeTrue()
    expect(existsSync('./dist/styles.css')).toBeTrue()
    expect(existsSync('./dist/index.js')).toBeTrue()

    const content = await readFile('./dist/index.js', 'utf-8')
    expect(content.includes('../aria-build' )).toBeTrue()
  })

  it('should copy files with target.recursive', async () => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': '',
        'bundles': {
          'index.js': ''
        }
      }
    })

    await copyAssets({ 
      targets: [
        { src: './public/**/*', dest: 'dist', recursive: true }
      ]
    })

    expect(existsSync('./dist/index.html')).toBeTrue()
    expect(existsSync('./dist/styles.css')).toBeTrue()
    expect(existsSync('./dist/bundles/index.js')).toBeTrue()
  })

})