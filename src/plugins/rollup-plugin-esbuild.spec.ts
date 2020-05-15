import * as sinon from 'sinon'
import * as path from 'path'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { Service, startService, TransformResult } from 'esbuild'

import { resolveId, transformCode } from './rollup-plugin-esbuild'

describe('rollup-plugin-esbuild', () => {
  let service: Service | undefined

  before(async () => {
    service = await startService()
  })

  after(() => {
    service.stop()
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should resolveId with origin', () => {
    const { normalize } = path

    const extensions = [ 'ts' ]

    mockfs({
      './src/index.ts': `import ./hello-world`,
      './src/hello-world.ts': 'console.log(``)'
    })

    const file = resolveId(extensions)('./hello-world', './src/index.ts')
    expect(file).equal(normalize('./src/hello-world.ts'))
  })

  it('should resolveId importe is not exist', () => {
    const extensions = [ 'ts' ]

    mockfs({
      './src/index.ts': `import ./hello-world`,
      './src/hello-world.vue': 'console.log(``)'
    })

    const file = resolveId(extensions)('./hello-world', './src/index.ts')
    expect(file).toBeUndefined()
  })

  it('should resolveId origin is undefined', () => {
    const { normalize } = path

    const extensions = [ 'ts' ]

    mockfs({
      './src/index.ts': `console.log('')`,
    })

    const file = resolveId(extensions)('./src/index.ts', undefined)
    expect(file).equal(normalize(file))
  })

  it('should transform code', async () => {
    const content = `console.log('')`

    const transformStub = sinon.spy(service, 'transform')

    const { code, map } = await transformCode(service)(content, './src/index.ts')
    const mapResult = JSON.parse(map)

    expect(code.replace(/\n/g, '')).equal('console.log("");'.replace(/\n/g, ''))
    expect(mapResult.version).equal(3)
    expect(mapResult.sources.length).equal(1)
    expect(mapResult.sourcesContent.length).equal(1)
    expect(mapResult.mappings).equal('AAAA,QAAQ,IAAI;')
    expect(mapResult.names.length).equal(0)

    expect(transformStub.called).toBeTrue()
  })

  it('should transform code with options and js file', async () => {
    const result: TransformResult = {
      js: null,
      jsSourceMap: '',
      warnings: []
    }

    const transformStub = sinon.stub(service, 'transform')
      .returns(Promise.resolve(result))

    const { code, map } = await transformCode(service, { target: 'es2015' })('', './src/index.js')

    expect(code).equal('')
    expect(map).equal('')
    expect(transformStub.called).toBeTrue()
  })

})