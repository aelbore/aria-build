import { copy } from './src'
import { link } from './tools/link-plugin'
import { replaceContent } from './tools/common'

export default {
  plugins: {
    after: [
      copy({
        targets: [
          { src: 'bin/*', dest: 'dist/bin', replace: replaceContent }
        ]
      }),
      link({
        targets: [
          { package: 'aria-fs' },
          { package: 'aria-mocha' },
          { package: 'lit-element-transpiler' }
        ]
      })
    ]
  }
}