import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { rollupGenerate } from './generate'

describe('rollupGenerate', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should generate output', async () => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })

    const options = {
      inputOptions: {
        input: './src/input.ts',
        external: [ 'fs' ]
      },
      outputOptions: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    const output = await rollupGenerate(options)
    
    expect(output[0].code).equal("import 'fs';\n")
  })

})