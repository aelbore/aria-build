import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { TransformResult } from 'esbuild'

import { transformCode } from './rollup-plugin-esbuild'

describe('rollup-plugin-esbuild', () => {

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should transform code', async () => {
    const content = `console.log('')`

    const { code, map } = await transformCode()(content, './src/index.ts')
    const mapResult = JSON.parse(map)

    expect(code.replace(/\n/g, '')).equal('console.log("");'.replace(/\n/g, ''))
    expect(mapResult.version).equal(3)
    expect(mapResult.sources.length).equal(1)
    expect(mapResult.sourcesContent.length).equal(1)
    expect(mapResult.mappings).equal('AAAA,QAAQ,IAAI;')
    expect(mapResult.names.length).equal(0)
  })

  it('should transform code with options and js file', async () => {
    const result: TransformResult = {
      code: null,
      map: '',
      warnings: []
    }

    const { code, map } = await transformCode({ target: 'es2015' })('', './src/index.js')
  })

})