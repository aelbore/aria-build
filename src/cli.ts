import { DEFAULT_OUT_DIR } from './cli-common'
import { handler } from './cli-handler'

export async function run(version: string) {
  const program = require('sade')('aria-build', true)

  program
    .version(version)
    .option('-d, --declaration', 'Generates corresponding .d.ts file', false)
    .option('-f, --format', 'build specified formats', 'es,cjs')
    .option('-i, --entry', 'Entry module(s)')
    .option('-o, --output', 'Directory to place build files into', DEFAULT_OUT_DIR)
    .option('-c, --config', 'config file of aria-build. i.e aria.config.ts')
    .option('--external', 'Specify external dependencies')
    .option('--resolve', 'Resolve dependencies')
    .option('--clean', 'Clean the dist folder default', DEFAULT_OUT_DIR)
    .option('--globals', 'Specify globals dependencies')
    .option('--sourcemap', 'Generate source map')
    .option('--name', 'Specify name exposed in UMD builds')
    .option('--compress', 'Compress or minify the output')
    .action(handler)
    .parse(process.argv)
}