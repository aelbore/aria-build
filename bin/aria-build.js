#!/usr/bin/env node --no-warnings

require('child_process')
  .spawnSync('ts-esm', [ 
    '--experimental-json-modules',
    './bin/exec.mjs',
    ...process.argv.slice(2) 
  ], { 
    stdio: 'inherit' 
  })