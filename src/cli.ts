import { handler } from './cli-handler'
import { getCliOptions } from './cli-options'

export async function run(version: string) {
  const cliOptions = getCliOptions()
  const program = require('sade')(cliOptions.package, true)

  await Promise.all(cliOptions.options.map(option => {
    program.option(option.alias, option.description, option.defaultValue ?? null)
  }))

  program
    .version(version)
    .action(handler)
    .parse(process.argv)
}