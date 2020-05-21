import { copy, replaceContent } from '../src'

export function replace(filename: string) {
  return replaceContent({ filename, strToFind: '../src',  strToReplace: '../aria-build' })
}

export const plugins = [
  copy({
    targets: [
      { src: 'bin/*', dest: 'dist/bin', replace }
    ]
  })
]