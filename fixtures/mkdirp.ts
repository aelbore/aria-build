import * as fs from 'fs'
import * as path from 'path'

function mkdirp(directory: string): void {
  const dirPath = path.resolve(directory).replace(/\/$/, '').split(path.sep);
  for (let i = 1; i <= dirPath.length; i++) {
    const segment = dirPath.slice(0, i).join(path.sep);
    if (!fs.existsSync(segment) && segment.length > 0) {
      fs.mkdirSync(segment);
    }
  }
}

export { mkdirp }