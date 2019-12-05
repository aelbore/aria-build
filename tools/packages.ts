import { execSync } from 'child_process'
import { symlinkDir } from '../src'

(async function() {
  const packages = [
    "aria-fs",
    "aria-mocha",
    "lit-element-transpiler",
    "rollup-plugin-inline-lit-element"
  ]

  await Promise.all(packages.map(pkg => {
    execSync(`npm run build --prefix ./packages/${pkg}`)
  }))

  await Promise.all([
    await symlinkDir(
      './packages/aria-mocha/dist', 
      './packages/aria-fs/node_modules/aria-mocha'
    ),
    await symlinkDir(
      './packages/aria-mocha/dist', 
      './packages/lit-element-transpiler/node_modules/aria-mocha'
    )
  ])    
})()