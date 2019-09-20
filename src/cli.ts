import * as fs from 'fs'

import { resolve, join } from 'path'

import { TSRollupConfig } from './ts-rollup-config'
import { getPackageJson } from './utils'
import { bundle } from './build'
import { clean } from './fs'

const DEFAULT_OUT_DIR = 'dist'

export interface BuildOptions {
  declaration?: boolean;
  format?: string;
  external?: string;
  plugins?: any[];
  clean?: string;
}

export interface BuildFormatOptions extends BuildOptions {
  pkgName?: string, 
  dependencies?: string[]
}

export async function run() {
  const pkg = require('../package.json')
  const program = require('sade')('aria')

  const getInputFile = memoize(getEntryFile)
  const getExternalDeps = memoize(getExternal)

  program
    .version(pkg.version)
    .option('-d, --declaration', 'Generates corresponding .d.ts file', false)
    .option('-f, --format', 'build specified formats', 'es,cjs')
    .option('--external', 'Specify external dependencies')
    .option('--clean', 'Clean the dist folder default', 'dist') 
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

  function buildES({ pkgName, dependencies, declaration, external, plugins }: BuildFormatOptions): TSRollupConfig {
    const input = getInputFile(pkgName)
    const file = `./${DEFAULT_OUT_DIR}/${pkgName}.es.js`

    const configOptions: TSRollupConfig = {
      input,
      plugins,
      external: getExternalDeps({ external, dependencies }),
      output: { 
        file, 
        format: 'es' 
      },
      tsconfig: {
        compilerOptions: {
          declaration
        }
      }
    }

    return configOptions
  }

  function buildCommonJS({ pkgName, dependencies, external }: BuildFormatOptions): TSRollupConfig {
    const input = getInputFile(pkgName)
    const file = `./${DEFAULT_OUT_DIR}/${pkgName}.js`

    const configOptions: TSRollupConfig = {
      input,
      external: getExternalDeps({ external, dependencies }),
      output: { 
        file, 
        format: 'cjs' 
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
      dependencies = Object.keys(pkgJson.dependencies)

    options.plugins = await getRollupPlugins()

    const formats = options.format.split(',')
    const configOptions = await Promise.all(formats.map(format => {
      const args = { pkgName, dependencies, ...options }
      switch(format) {
        case 'es': return buildES(args)
        case 'cjs': return buildCommonJS(args)
      }
    }))

    if (options.clean) {
      await clean(options.clean)
    }
    await bundle(configOptions)
  }

}