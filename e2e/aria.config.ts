import { copy } from '../src/plugins/rollup-plugin-copy'
import { defineConfig } from '../src/common/types'

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: './*.lock', dest: './node_modules/.tmp/dist/dts'  }
      ]
    })
  ]
})