import { copy, replaceContent } from '../src'

export async function replace(filename: string) {
  await replaceContent({ 
    filename, 
    strToFind: '../src',  
    strToReplace: '../aria-build', 
    extensions: [ '.mjs' ] 
  })
  return replaceContent({ 
    filename, 
    strToFind: './bin/exec.mjs',  
    strToReplace: './node_modules/aria-build/bin/exec.mjs'
  })
}

export const plugins = [
  copy({
    targets: [
      { src: 'bin/*', dest: 'dist/bin', replace }
    ]
  })
]