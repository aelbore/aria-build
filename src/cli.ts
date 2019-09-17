import { TSRollupConfig } from './ts-rollup-config'
import { getPackageName } from './utils'
import { exist, clean } from './fs'
import { settle } from './settle'
import { bundle } from './build'

export async function run() {
  const sade = require('sade')

  const pkg = require('../package.json')
  const program = sade('aria')

  program
    .version(pkg.version)
    .option('-d, --declaration')
    .option('-f, --format')
    .option('-p, --prod')
    .command('build [src] [dest]')
    .action(handler)
    .parse(process.argv)

  async function getIndexFile(src: string) {
    const path = await import('path')
    const baseRootPath = path.resolve()

    const tsIndexPath = './src/index.ts'
    const jsIndexPath = path.join(path.resolve(), src, 'index.js')

    const [ isTSExist, isJSExist ] = await settle([ exist(tsIndexPath), exist(jsIndexPath)  ])

    if (isTSExist) return tsIndexPath

    if (isJSExist) return jsIndexPath

    return null
  }
  
  async function handler(src = 'src', dest = 'dist', options) {
    const input = await getIndexFile(src)
    // const file = './dist/aria-build.es.js'

    // const { declaration, format } = options

    // const tsconfig = {
    //   ...(declaration 
    //     ? {
    //       tsconfig: {
    //         compilerOptions: {
    //           declaration: true
    //         }
    //       }
    //     }
    //     : {}
    //   )
    // }

    const external = [
      ...Object.keys(pkg.dependencies)
    ]

    // const configOptions: TSRollupConfig = {
    //   input,
    //   external,
    //   output: {
    //     format,
    //     file
    //   },
    //   tsconfig
    // }

    console.log(input)

    const configOptions: TSRollupConfig[] = [
      {
        input,
        external,
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
    ]

    await clean('dist')
    await bundle(configOptions)
  }

}