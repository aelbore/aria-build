#!/usr/bin/env node

require('child_process')
  .spawnSync('ts-esm', [ 
    '--no-warnings',
    '--experimental-module',
    '--experimental-json-modules',
    './bin/exec.mjs',
    ...process.argv.slice(2) 
  ], { 
    stdio: 'inherit' 
  })