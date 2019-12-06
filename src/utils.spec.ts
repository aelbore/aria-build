import * as assert from 'assert'
import * as mock from 'mock-fs';
import * as path from 'path'
import { exist } from './fs';
import { 
  getPackageJsonFile, 
  getPackageName, 
  copyReadmeFile, 
  copyReadMeFile, 
  copyPackageFile, 
  DEFAULT_VALUES, 
  createDtsEntry 
} from './utils';
import { readFile } from './fs';

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

  it('should [createDtsEntry], when has no ./dist/src/index.d.ts file', async() => {
    const dest = DEFAULT_VALUES.DIST_FOLDER
    const dtsFile = `${dest}/aria-build.d.ts`
    const content = `export * from './src/aria-build'`

    mock({
      [`${dest}/src`]: {}
    })

    await createDtsEntry()

    const isExistFile = await exist(dtsFile)
    assert.strictEqual(isExistFile, true)

    const actualContent = await readFile(dtsFile, 'utf-8')
    assert.strictEqual(actualContent.trim(), content)
  })

  it('should [createDtsEntry], when has no ./dist/src/index.d.ts file and has --output option', async() => {
    const output = 'public'
    const dtsFile = `${output}/aria-build.d.ts`
    const content = `export * from './src/aria-build'`

    mock({
      [`${output}/src`]: {}
    })

    await createDtsEntry({ output })

    const isExistFile = await exist(dtsFile)
    assert.strictEqual(isExistFile, true)

    const actualContent = await readFile(dtsFile, 'utf-8')
    assert.strictEqual(actualContent.trim(), content)
  })

  it('should [createDtsEntry], when has ./dist/src/index.d.ts file', async() => {
    const dest = DEFAULT_VALUES.DIST_FOLDER
    const dtsFile = `${dest}/aria-build.d.ts`
    const content = `export * from './src/index'`

    const destFile = path.join(dest, 'src', 'index.d.ts')

    mock({
      [destFile]: content
    })

    await createDtsEntry()

    const isExistFile = await exist(dtsFile)
    assert.strictEqual(isExistFile, true)

    const actualContent = await readFile(dtsFile, 'utf-8')
    assert.strictEqual(actualContent.trim(), content)
  })

  it('should [createDtsEntry], when has ./dist/src/index.d.ts file and has --output option', async() => {    
    const output = 'public'
    const dtsFile = `${output}/aria-build.d.ts`
    const destFile = path.join(output, 'src', 'index.d.ts')
    const content = `export * from './src/index'`

    mock({
      [destFile]: content
    })

    await createDtsEntry({ output })

    const isExistFile = await exist(dtsFile)
    assert.strictEqual(isExistFile, true)

    const actualContent = await readFile(dtsFile, 'utf-8')
    assert.strictEqual(actualContent.trim(), content)
  })

})  