(async function() {
  const { exec } = await import('../dist/aria-build')

  async function execute(command: string) {
    await exec(`${command} ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js`)
  }

  process.platform.includes('win32') 
    ? await execute('type')
    : await execute('cat')
})()