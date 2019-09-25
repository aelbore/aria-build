import * as fs from 'fs'

import { resolve, join, dirname } from 'path'

import { TSRollupConfig } from './ts-rollup-config'
import { getPackageJson } from './utils'
import { bundle } from './build'
import { clean } from './fs'
import { mkdirp } from 'aria-fs'

const DEFAULT_OUT_DIR = 'dist'

export interface BuildOptions {
  declaration?: boolean;
  format?: string;
  external?: string;
  plugins?: any[];
  name?: string;
  globals?: string;
  clean?: string;
  sourcemap?: boolean;
}

export interface BuildFormatOptions extends BuildOptions {
  pkgName?: string, 
  dependencies?: string[]
}

export async function run(version: string) {
  const program = require('sade')('aria')

  const getInputFile = memoize(getEntryFile)
  const getExternalDeps = memoize(getExternal)
  const getUmdGlobals = memoize(getGlobals)

  program
    .version(version)
    .option('-d, --declaration', 'Generates corresponding .d.ts file', false)
    .option('-f, --format', 'build specified formats', 'es,cjs')
    .option('--external', 'Specify external dependencies')
    .option('--clean', 'Clean the dist folder default', 'dist') 
    .option('--globals', `Specify globals dependencies`)
    .option('--sourcemap', 'Generate source map', false)
    .option('--name', 'Specify name exposed in UMD builds')
    .command('build [...entries]')
    .action(handler)
    .parse(process.argv)

  function memoize(fn: any){
    let cache = {};
    return (...args) => {
      let index = JSON.stringify(args);
      if (index in cache) {
        return cache[index];
      }
      else {
        return (cache[index] = fn.apply(this, args));
      }
    }
  }

  function getGlobals(globals: string = '') {
    const results = globals.split(',')
    const values = {}

    results.forEach(result => {
      const value = result.split('=')
      values[value[0]] = value[1]
    })

    return values
  }

  function getExternal({ external, dependencies }) {
    return [
      ...(external 
            ? external.split(',')
            : dependencies
          )
    ]
  }

  function getEntryFile(pkgName: string) {
    const rootDir = resolve()
    const tsPkgPath = join(rootDir, 'src', `${pkgName}.ts`),
      jsPkgPath = tsPkgPath.replace('.ts', '.js'),
      tsIndexPath = join(rootDir, 'src', 'index.ts'),
      jsIndexPath = tsIndexPath.replace('.ts', '.js')
    
    const removeRootDir = (filePath: string) => filePath.replace(rootDir, '.')

    if (fs.existsSync(tsPkgPath)) return removeRootDir(tsPkgPath)

    if (fs.existsSync(jsPkgPath)) return removeRootDir(jsPkgPath)

    if (fs.existsSync(tsIndexPath)) return removeRootDir(tsIndexPath)

    if (fs.existsSync(jsIndexPath)) return removeRootDir(jsIndexPath)

    throw new Error('Entry file is not exist.')
  }

  function buildES({ pkgName, dependencies, declaration, external, plugins, sourcemap }: BuildFormatOptions): TSRollupConfig {
    const input = getInputFile(pkgName)
    const file = `./${DEFAULT_OUT_DIR}/${pkgName}.es.js`

    const configOptions: TSRollupConfig = {
      input,
      plugins,
      external: getExternalDeps({ external, dependencies }),
      output: { 
        file, 
        format: 'es',
        sourcemap
      },
      tsconfig: {
        compilerOptions: {
          declaration
        }
      }
    }

    return configOptions
  }

  function buildCommonJS({ pkgName, dependencies, external, sourcemap }: BuildFormatOptions): TSRollupConfig {
    const input = getInputFile(pkgName)
    const file = `./${DEFAULT_OUT_DIR}/${pkgName}.js`

    const configOptions: TSRollupConfig = {
      input,
      external: getExternalDeps({ external, dependencies }),
      output: { 
        file, 
        format: 'cjs',
        sourcemap
      }
    }

    return configOptions
  }

  function buildUmd({ pkgName, dependencies, external, globals, name, sourcemap }: BuildFormatOptions): TSRollupConfig {
    const input = getInputFile(pkgName)
    const file = `./${DEFAULT_OUT_DIR}/bundles/${pkgName}.umd.js`

    mkdirp(dirname(file))

    const configOptions: TSRollupConfig = {
      input,
      external: getExternalDeps({ external, dependencies }),
      output: { 
        file, 
        format: 'umd',
        globals: {
          ...getUmdGlobals(globals)
        },
        name,
        sourcemap
      }
    }

    return configOptions
  }

  async function getRollupPlugins() {
    const ROLLUP_CONFIG_PATH = resolve('aria.config.ts')
    if (fs.existsSync(ROLLUP_CONFIG_PATH)) {
      const rollupConfig = require(ROLLUP_CONFIG_PATH)
      if (rollupConfig.default.plugins) {
        return rollupConfig.default.plugins
      }
    }
    return null
  }
  
  async function handler(str: any, options?: BuildOptions) {
    const pkgJson = getPackageJson(), 
      pkgName = pkgJson.name,
      dependencies = pkgJson.dependencies 
        ? Object.keys(pkgJson.dependencies)
        : []

    options.plugins = await getRollupPlugins()

    console.log(options.sourcemap)

    if (options.clean) {
      await clean(options.clean)
    }

    const formats = options.format.split(',')
    const configOptions = await Promise.all(formats.map(format => {
      const args = { pkgName, dependencies, ...options }
      switch(format) {
        case 'es': return buildES(args)
        case 'cjs': return buildCommonJS(args)
        case 'umd': return buildUmd(args)
      }
    }))

    await bundle(configOptions)
  }

}