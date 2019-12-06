import * as assert from 'assert'
import * as mock from 'mock-fs';
import * as path from 'path'
import { exist } from './fs';
import { getPackageJsonFile, getPackageName, copyReadmeFile, copyReadMeFile, copyPackageFile } from './utils';

describe('utils', () => {

  afterEach(() => {
    mock.restore()
  })

  it('should read the package.json file', async () => { 
    const pkg = await getPackageJsonFile()
    assert.strictEqual(pkg.name, 'aria-build');
  })

  it('should get package name.', () => {
    const pkgName = getPackageName()
    assert.strictEqual(pkgName, 'aria-build')
  })

  it('should copy the readme file. [copyReadmeFile]', async () => {
    mock({
      'README.md': '',
      'dist': {}
    })
    await copyReadmeFile()

    const isFileExist = await exist(path.join('dist', 'README.md'))
    assert.strictEqual(isFileExist, true)
  })

  it('should copy the readme file. [copyReadMeFile]', async () => {
    const output = 'public', file = 'README.md'
    mock({
      [file]: '',
      [output]: {}
    })
    await copyReadMeFile({ output })

    const isFileExist = await exist(path.join(output, file))
    assert.strictEqual(isFileExist, true)
  })

  it('should copy package.json to destination. [copyPackageFile]', async () => {
    let dest = 'dist'

    const isFileExist = (dest: string) => {
      return exist(path.join(dest, 'package.json'))
    }

    mock({ 
      [dest]: {} 
    })
    await copyPackageFile()
    assert.strictEqual(await isFileExist(dest), true)
  })

})  