import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { transform } from './rollup-plugin-import'
import { KeyValue } from '../utils/utils'

describe('rollup-plugin-import', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should transform module specifier', () => {
    const content = `
      import { CustomElement } from 'custom-elements-ts'
      import { join } from 'path'

      class Hello extends CustomElement { }
    `
    const specifiers: KeyValue = { 
      'custom-elements-ts': './dist/custom-elements-ts.js'
    }

    mockfs({
      './src/input.ts': content
    })

    transform('./src/input.ts', content, specifiers)
  })


})