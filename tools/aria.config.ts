import { inlineLitElement } from 'rollup-plugin-inline-lit-element'
import { minifyHTML, copy } from '../src'

export default {
  plugins: [
    inlineLitElement(),
    minifyHTML(),
    copy({
      targets: [
        { src: './tools/index.html', dest: './dist' }
      ]
    })
  ]
}