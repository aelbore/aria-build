import * as path from 'path'
import { readFile, replace, writeFile } from '../src'

export const replaceContent = async (filename: string) => {
  if (path.extname(filename).includes('.js')) {
    let content = await readFile(filename, 'utf8')
    if (content.includes('../src')) {
      content = replace(content, '../src', '../aria-build')
      await writeFile(filename, content)
    }
  }
  return Promise.resolve()
}