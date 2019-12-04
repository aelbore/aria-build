import { copy, replaceContent, linkToPackages } from '../src'

function replace(filename: string) {
  return replaceContent({ filename, strToFind: '../src',  strToReplace: '../aria-build' })
}

export const plugins = [
  copy({
    targets: [
      { src: 'bin/*', dest: 'dist/bin', replace }
    ]
  }),
  linkToPackages({
    moduleDir: 'aria-build',
    targets: [
      { package: 'aria-fs' },
      { package: 'aria-mocha' },
      { package: 'lit-element-transpiler' }
    ]
  })
]