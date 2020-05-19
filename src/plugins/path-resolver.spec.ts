import * as mockfs from 'mock-fs'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { pathResolver } from './path-resolver'

describe('path-resolver', () => {

  afterEach(() => {
    mockfs.restore()
  })

  it('should resolveId with origin', () => {
    const { normalize } = path

    const extensions = [ 'ts' ]

    mockfs({
      './src/index.ts': `import ./hello-world`,
      './src/hello-world.ts': 'console.log(``)'
    })

    const file = pathResolver(extensions)('./hello-world', './src/index.ts')
    expect(file).equal(normalize('./src/hello-world.ts'))
  })

  it('should resolveId importe is not exist', () => {
    const extensions = [ 'ts' ]

    mockfs({
      './src/index.ts': `import ./hello-world`,
      './src/hello-world.vue': 'console.log(``)'
    })

    const file = pathResolver(extensions)('./hello-world', './src/index.ts')
    expect(file).toBeUndefined()
  })

  it('should resolveId origin is undefined', () => {
    const { normalize } = path

    const extensions = [ 'ts' ]

    mockfs({
      './src/index.ts': `console.log('')`,
    })

    const file = pathResolver(extensions)('./src/index.ts', undefined)
    expect(normalize(file)).equal(normalize(file))
  })

  it('should resolvedId with index inside folder', () => {
    const { normalize } = path

    const extensions = [ 'ts' ]

    mockfs({
      './src/foo/index.ts': {},
      './src/index.ts': `import ./foo`,
    })

    const file = pathResolver(extensions)('./foo', './src/index.ts')
    expect(normalize(file)).equal(normalize('./src/foo/index.ts'))
  })

  it('shoule resolvedId with empty parameters (extensions)', () => {
    const { normalize } = path

    mockfs({
      './src/index.ts': `import ./hello-world`,
      './src/hello-world.ts': 'console.log(``)'
    })

    const file = pathResolver()('./hello-world', './src/index.ts')
    expect(file).equal(normalize('./src/hello-world.ts'))
  })

  it('should not reolvedId when index file inside folder is not exist', () => {
    const extensions = [ 'ts' ]

    mockfs({
      './src/foo': {},
      './src/index.ts': `import ./foo`,
    })

    const file = pathResolver(extensions)('./foo', './src/index.ts')
    expect(file).toBeUndefined()
  })

})