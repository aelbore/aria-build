(async function() {
  const { exec } = await import('../dist/aria-build')

  process.platform.includes('win32') 
    ? await exec(`type coverage/lcov.info | coveralls/bin/coveralls.js`)
    : await exec(`cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js`)
})()