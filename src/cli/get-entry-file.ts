import { join } from 'path'
import { existsSync } from 'fs'

export function getEntryFile(pkgName: string) {
  const entryFiles = [  
    'index.ts',
    'index.js',
    'main.ts',
    'main.js',
    `${pkgName}.ts`,
    `${pkgName}.js`
  ]

  for (const entry of entryFiles) {
    const file = join('src', entry)
    if (existsSync(file)) {
      return file
    }
  }

  throw new Error('Entry file is not exist.')
}