[![npm version](https://badge.fury.io/js/aria-build.svg)](https://www.npmjs.com/package/aria-build)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# aria-build
Build any web components

Installation
------------

  ```
    npm install --save-dev aria-build
  ```

### Setup
```javascript
import { bundle, TSRollupConfig, clean } from 'aria-build'

(async function() {
  const pkg = require('./package.json')

  const external = [
    ...Object.keys(pkg.dependencies)
  ]

  const options: TSRollupConfig = {
    input: './src/index.ts',
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
  
  await clean('dist')
  await bundle(options)
})()
```