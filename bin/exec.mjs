import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(fileURLToPath(import.meta.url))

const pkg = require('../package.json')
require('../src').run(pkg.version)