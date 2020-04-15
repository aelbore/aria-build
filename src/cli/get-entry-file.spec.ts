import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { getEntryFile } from './get-entry-file'

describe('get-entry-file', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should not get the existing entry file', () => {
    mockfs({
      'dist': {}
    })

    try {
      getEntryFile('sample-package')
    } catch(e) {
      expect(e.message).toThrow('Entry file is not exist.')
    }
  })

})