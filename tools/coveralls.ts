(async function() {
  const { exec } = await import('../dist/aria-build')

  process.platform.includes('linux') 
    && await exec(`cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js`)
})()