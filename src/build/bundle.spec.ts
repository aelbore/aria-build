import * as sinon from 'sinon'
import * as mockfs from 'mock-fs'

import { expect } from 'aria-mocha'
import { TSRollupConfig } from '../config/config'
import { bundle, __bundle } from './bundle'

describe('bundle', () => {
  let build: typeof import('./build')
  let utils: typeof import('../utils/utils')

  function createStubs() {
    const copyPackageFileStub = sinon.stub(utils, 'copyPackageFile')
    .returns(Promise.resolve(void 0))
    const copyReadMeFileStub = sinon.stub(utils, 'copyReadMeFile')
      .returns(Promise.resolve(void 0))
    const renameDtsEntryFileStub = sinon.stub(utils, 'renameDtsEntryFile')
      .returns(Promise.resolve(void 0))
    const moveDtsFilesStub = sinon.stub(utils, 'moveDtsFiles')
      .returns(Promise.resolve(void 0))

    return {
      copyPackageFileStub,
      copyReadMeFileStub,
      renameDtsEntryFileStub,
      moveDtsFilesStub
    }
  }

  before(async() => {
    [ build, utils ] = await Promise.all([ import('./build'), import('../utils/utils') ])
  })

  afterEach(() => {
    mockfs.restore()
    sinon.restore()
  })

  it('should bundle with config', async () => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })

    const configOptions: TSRollupConfig = {
      input: './src/input.ts',
      external: [ 'fs' ],
      output: {
        file: './dist/input.js',
        format: 'es'
      }
    }

    const buildStub = sinon.stub(build, 'build').returns(Promise.resolve(null))
    const { copyPackageFileStub, copyReadMeFileStub, renameDtsEntryFileStub, moveDtsFilesStub } = createStubs()

    await bundle(configOptions)

    expect(buildStub.called).toBeTrue()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(renameDtsEntryFileStub.called).toBeTrue()
    expect(moveDtsFilesStub.called).toBeTrue()
  })

  it('should __bundle with config', async () => {
    mockfs({
      'dist': {},
      './src/input.ts': `import * as fs from 'fs'`
    })

    const config: TSRollupConfig = {
      input: './src/input.ts',
      external: [ 'fs' ],
      output: [
        {
          file: './dist/input.js',
          format: 'es'
        }
      ]
    }

    const buildStub = sinon.stub(build, '__build').returns(Promise.resolve(null))
    const { copyPackageFileStub, copyReadMeFileStub, renameDtsEntryFileStub, moveDtsFilesStub } = createStubs()

    await __bundle(config)

    expect(buildStub.called).toBeTrue()
    expect(copyPackageFileStub.called).toBeTrue()
    expect(copyReadMeFileStub.called).toBeTrue()
    expect(renameDtsEntryFileStub.called).toBeTrue()
    expect(moveDtsFilesStub.called).toBeTrue()
  })

})