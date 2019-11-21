[![npm version](https://badge.fury.io/js/aria-build.svg)](https://www.npmjs.com/package/aria-build)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# aria-build
Build

Installation
------------
  ```
    npm install --save-dev aria-build
  ```

### CLI Options
```
  Usage
    $ aria-build [options]

  For more info, run any command with the `--help` flag
    $ aria-build --help

  Options
    -d, --declaration    Generates corresponding .d.ts file  (default false)
    -f, --format         build specified formats  (default es,cjs)
    -i, --entry          Entry module(s)
    -o, --output         Directory to place build files into  (default dist)
    -c, --config         config file of aria-build. i.e aria.config.ts
    --external           Specify external dependencies
    --clean              Clean the dist folder default  (default dist)
    --globals            Specify globals dependencies
    --sourcemap          Generate source map  (default false)
    --name               Specify name exposed in UMD builds
    --compress           Compress or minify the output  (default false)
    -v, --version        Displays current version
    -h, --help           Displays this message
```

### API Setup
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