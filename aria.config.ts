import * as path from 'path'
import { copy, readFile, replace, writeFile } from './src'
import { link } from './tools/link-plugin'

const replaceContent = async (filename: string) => {
  if (path.extname(filename).includes('.js')) {
    let content = await readFile(filename, 'utf8')
    if (content.includes('../src')) {
      content = replace(content, '../src', '../aria-build')
      await writeFile(filename, content)
    }
  }
  return Promise.resolve()
}

export default {
  plugins: {
    after: [
      copy({
        targets: [
          { src: 'bin/*', dest: 'dist/bin', replace: replaceContent }
        ]
      }),
      link({
        targets: [
          { package: 'aria-fs' },
          { package: 'aria-mocha' },
          { package: 'lit-element-transpiler' }
        ]
      })
    ]
  }
}