import { getPackageJson, copyPackageFile, copyReadmeFile, moveDtsFiles, renameDtsEntryFile } from './utils'
import { build } from './build'
import { clean } from './fs'
import { BuildOptions } from './cli-common' 
import { getRollupPlugins } from './cli-utils'
import { buildCommonJS } from './cli-build-cjs'
import { buildES } from './cli-build-es'
import { buildUmd } from './cli-build-umd'
import { settle } from './settle'

export async function run(version: string) {
  const program = require('sade')('aria-build', true)

  program
    .version(version)
    .option('-d, --declaration', 'Generates corresponding .d.ts file', false)
    .option('-f, --format', 'build specified formats', 'es,cjs')
    .option('-i, --entry', 'Entry module(s)')
    .option('--external', 'Specify external dependencies')
    .option('--clean', 'Clean the dist folder default', 'dist') 
    .option('--globals', `Specify globals dependencies`)
    .option('--sourcemap', 'Generate source map', false)
    .option('--name', 'Specify name exposed in UMD builds')
    .option('--compress', 'Compress or minify the output')
    .action(handler)
    .parse(process.argv)

  async function handler(options?: BuildOptions) {
    const entry = options.entry;

    const pkgJson = getPackageJson(), 
      pkgName = pkgJson.name,
      dependencies = pkgJson.dependencies 
        ? Object.keys(pkgJson.dependencies)
        : []

    options.plugins = await getRollupPlugins()

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

    await build(configOptions)
    await settle([ copyPackageFile({ entry }), copyReadmeFile(), renameDtsEntryFile(configOptions, entry) ])
    await moveDtsFiles({ entry })
  }

}