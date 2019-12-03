import { TSRollupConfig, clean, terser, minifyHTML, bundle } from '../src'
import { inlineLitElement } from 'rollup-plugin-inline-lit-element'

(async function() {

  const configOptions: TSRollupConfig = {
    input: './examples/hello-world.js',
    plugins: [ 
      inlineLitElement(), 
      terser({ 
        output: { 
          comments: false,
        }
      }),
      minifyHTML()
    ],    
    output: {
      format: 'es',
      file: './dist/hello-world.js'
    },
    tsconfig: {
      compilerOptions: { 
        declaration: true 
      }
    }
  }

  await clean('dist')
  await bundle(configOptions)
})()