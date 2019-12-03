import { terser, minifyHTML } from '../src'
import { inlineLitElement } from 'rollup-plugin-inline-lit-element'

export default {
  plugins: {
    before: [
      inlineLitElement(), 
      terser({ 
        output: { 
          comments: false,
        }
      }),
      minifyHTML()
    ]
  }
}