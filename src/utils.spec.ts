import * as mock from 'mock-fs'
import * as path from 'path'

import { expect } from 'aria-mocha'
import { exist } from './fs'
import { 
  getPackageJsonFile, 
  getPackageName, 
  copyReadmeFile, 
  copyReadMeFile, 
  copyPackageFile, 
  DEFAULT_VALUES, 
  createDtsEntry, 
  renameDtsEntryFile
} from './utils'
import { readFile } from './fs'
import { TSRollupConfig } from './ts-rollup-config'

describe('utils', () => {
  let cache: NodeModule;

  beforeEach(() => {
    cache = require.cache[path.resolve('package.json')]
  })

  afterEach(() => {
    mock.restore()
    require.cache[path.resolve('package.json')] = cache
  })

  it('should read the package.json file', async () => { 
    const pkg = await getPackageJsonFile()
    expect(pkg.name).equal('aria-build')
  })

  it('should get package name.', () => {
    const pkgName = getPackageName()
    expect(pkgName).equal('aria-build')
  })

  it('should copy the readme file. [copyReadmeFile]', async () => {
    mock({
      'README.md': '',
      'dist': {}
    })
    await copyReadmeFile()

    const isFileExist = await exist(path.join('dist', 'README.md'))
    expect(isFileExist).toBeTrue()
  })

  it('should copy the readme file. [copyReadmeFile] with filePath.', async () => {
    mock({
      'tmp/README.md': '',
      'dist': {}
    })
    await copyReadmeFile('./tmp/README.md')

    const isFileExist = await exist('./dist/README.md')
    expect(isFileExist).toBeTrue()
  })

  it('should copy the readme file. [copyReadMeFile]', async () => {
    const output = 'public', file = 'README.md'
    mock({
      [file]: '',
      [output]: {}
    })
    await copyReadMeFile({ output })

    const isFileExist = await exist(path.join(output, file))
    expect(isFileExist).toBeTrue()
  })

  it('should copy package.json to destination. [copyPackageFile]', async () => {
    delete require.cache[path.resolve('package.json')]
    
    const dest = 'dist'

    mock({ 
      [dest]: {},
      'package.json': `
        {
          "name": "aria-fs"
        }
      `
    })

    await copyPackageFile()

    const filePath = path.resolve('./dist/package.json')
    const isExist = await exist(filePath)
  
    const content = await readFile(filePath, 'utf-8');
    const pkg = JSON.parse(content)

    expect(isExist).toBeTrue()
    expect(pkg.name).equal('aria-fs')
  })

  it('should copy package.json to destination. [copyPackageFile] with options.', async () => {
    delete require.cache[path.resolve('package.json')]
    
    const dest = 'dist'

    mock({ 
      [dest]: {},
      'package.json': `
        {
          "name": "aria-fs"
        }
      `
    })

    await copyPackageFile({ format: 'es' })

    const filePath = path.resolve('./dist/package.json')
    const isExist = await exist(filePath)
  
    const content = await readFile(filePath, 'utf-8');
    const pkg = JSON.parse(content)

    expect(isExist).toBeTrue()
    expect(pkg.name).equal('aria-fs')
    expect(pkg.main).equal('aria-fs.js')
    expect(pkg.module).equal('aria-fs.js')
    expect(pkg.typings).equal('aria-fs.d.ts')
  })

  it('should [createDtsEntry], when has [filePath] as package.json path.', async () => {
    const dest = DEFAULT_VALUES.DIST_FOLDER
    const dtsFile = `${dest}/aria-build.d.ts`
    const content = `export * from './src/aria-build'`

    mock({
      [`${dest}/src`]: {},
      'package.json': `
        {
          "name": "aria-build"
        }
      `
    })

    await createDtsEntry({ filePath: path.resolve('./package.json') })

    const isExistFile = await exist(dtsFile)
    expect(isExistFile).toBeTrue()

    const actualContent = await readFile(dtsFile, 'utf-8')
    expect(actualContent.trim()).equal(content)
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
    expect(isExistFile).toBeTrue()

    const actualContent = await readFile(dtsFile, 'utf-8')
    expect(actualContent.trim()).equal(content)
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
    expect(isExistFile).toBeTrue()

    const actualContent = await readFile(dtsFile, 'utf-8')
    expect(actualContent.trim()).equal(content)
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
    expect(isExistFile).toBeTrue()

    const actualContent = await readFile(dtsFile, 'utf-8')
    expect(actualContent.trim()).equal(content)
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
    expect(isExistFile).toBeTrue()

    const actualContent = await readFile(dtsFile, 'utf-8')
    expect(actualContent.trim()).equal(content)
  })

  it('should [renameDtsEntryFile] rename index.d.ts to <package-name>.d.ts.', async () => {
    /// this will execute only when the 
    /// declaration is true
    const options: TSRollupConfig = {
      input: './src/index.ts',
      output: {
        file: './dist/aria-build.es.js',
        format: 'es'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mock({ 'dist/index.d.ts': '' })

    await renameDtsEntryFile(options)

    let isFileExist = await exist('./dist/aria-build.d.ts')
    expect(isFileExist).toBeTrue()

    isFileExist = await exist('./dist/index.d.ts')
    expect(isFileExist).toBeFalse()
  })

  it('should [renameDtsEntryFile] NOT rename index.d.ts to <package-name>.d.ts.', async () => {
    const options: TSRollupConfig = {
      input: './src/index.ts',
      output: {
        file: './dist/hello-world.es.js',
        format: 'es'
      },
      tsconfig: {
        compilerOptions: {
          declaration: false
        }
      }
    }

    mock({ 'dist/index.d.ts': '' })

    await renameDtsEntryFile(options)

    const isFileExist = await exist('./dist/index.d.ts')
    expect(isFileExist).toBeTrue()
  })

  it('should [renameDtsEntryFile] use --entry option as dts entry file.', async () => {
    /// this will execute only when the 
    /// declaration is true
    const options: TSRollupConfig = {
      input: './src/index.ts',
      output: {
        file: './dist/hello-world.es.js',
        format: 'es'
      },
      tsconfig: {
        compilerOptions: {
          declaration: true
        }
      }
    }

    mock({ './dist/hello-world.d.ts': '' })

    await renameDtsEntryFile(options, './src/hello-world.ts')

    const isFileExist = await exist('./dist/hello-world.d.ts')
    expect(isFileExist).toBeTrue();
  })
})  