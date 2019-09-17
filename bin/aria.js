#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

const TS_CONFIG_PATH = path.resolve('tsconfig.json')

const tsconfigDefaults = {
  "target": "esNext",
  "module": "commonjs",
  "lib" :[
    "dom", "es2015", "es2017"
  ],
  "allowJs": true
}

const compilerOptions = (fs.existsSync(TS_CONFIG_PATH) 
  ? require(TS_CONFIG_PATH).compilerOptions:
  {}
)

require('ts-node').register({
  compilerOptions: {
    ...compilerOptions,
    ...tsconfigDefaults
  }
})

require('../src/cli').run()