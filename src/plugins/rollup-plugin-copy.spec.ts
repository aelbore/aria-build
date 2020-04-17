import * as mockfs from 'mock-fs'

import { existsSync } from 'fs'
import { expect } from 'aria-mocha'

import { rollupGenerate } from '../build/index'
import { copy } from './rollup-plugin-copy'

describe('rollup-plugin-copy', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should copy files', async() => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': ''
      },
      './src/input.ts': `import * as fs from 'fs'`
    })

    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: [
          copy({
            targets: [
              { src: './public/*', dest: 'dist' }
            ]
          })
        ]
      },
      outputOptions: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    await rollupGenerate(options)

    expect(existsSync('./dist/index.html')).toBeTrue()
    expect(existsSync('./dist/styles.css')).toBeTrue()
  })

  it('should copy files with copyEnd', async() => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': ''
      },
      './src/input.ts': `import * as fs from 'fs'`
    })

    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: [
          copy({
            hook: 'buildStart',
            targets: [
              { src: './public/*', dest: 'dist' }
            ],
            copyEnd: async() => {}
          })
        ]
      },
      outputOptions: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    await rollupGenerate(options)

    expect(existsSync('./dist/index.html')).toBeTrue()
    expect(existsSync('./dist/styles.css')).toBeTrue()
  })

  it('should copy files without parameters', async() => {
    mockfs({
      'dist': {},
      'public': {
        'index.html': '',
        'styles.css': ''
      },
      './src/input.ts': `import * as fs from 'fs'`
    })

    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ],
        plugins: [ copy() ]
      },
      outputOptions: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    await rollupGenerate(options)

    expect(existsSync('./dist/index.html')).toBeFalse()
    expect(existsSync('./dist/styles.css')).toBeFalse()
  })

})