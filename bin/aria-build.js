#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

const TS_CONFIG_PATH = path.resolve('tsconfig.json')

const tsconfigDefaults = {
  "target": "es2018",
  "module": "commonjs",
  "lib" :[ "dom", "es2015", "es2017" ],
  "allowJs": true
}

const compilerOptions = (fs.existsSync(TS_CONFIG_PATH) 
  ? require(TS_CONFIG_PATH).compilerOptions:
  {}
)

delete compilerOptions.exclude
delete compilerOptions.include

require('ts-node').register({
  typeCheck: false,
  compilerOptions: {
    ...compilerOptions,
    ...tsconfigDefaults
  }
})

const pkg = require('../package.json')
require('../src').run(pkg.version)