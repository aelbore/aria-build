import * as mockfs from 'mock-fs'

import { existsSync } from 'fs'
import { expect } from 'aria-mocha'
import { rollup } from '../libs'
import { copy } from './rollup-plugin-copy'

describe('rollup-plugin-copy', () => {

  const build = async (plugins: any[]) => {
    const bundle = await rollup({
      input: './src/input.ts',
      external: [ 'fs' ],
      plugins
    })
    await bundle.generate({ 
      file: './dist/input.js',
      format: 'es' 
    })
  }

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

    await build([ 
      copy({
        targets: [
          { src: './public/*', dest: 'dist' } ]
      })
    ])

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

    await build([
      copy({
        hook: 'buildStart',
        targets: [
          { src: './public/*', dest: 'dist' } ],
        copyEnd: async() => {}
      })
    ])

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

    await build([ copy() ])

    expect(existsSync('./dist/index.html')).toBeFalse()
    expect(existsSync('./dist/styles.css')).toBeFalse()
  })

})