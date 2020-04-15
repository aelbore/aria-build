import { join } from 'path'
import { copyFile, exist } from '../fs/fs'

import { baseDir, DEFAULT_DEST } from './common'

export interface CopyReadmeOptions {
  filePath?: string
  output?: string
}

export async function copyReadMeFile(options?: CopyReadmeOptions) {
  const fileName = 'README.md'
  const src = options?.filePath ?? join(baseDir(), fileName)
  const destPath = join((options?.output ?? DEFAULT_DEST), fileName)
  await exist(src) 
    && await copyFile(src, destPath)
}
