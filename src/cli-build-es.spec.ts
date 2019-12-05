
import { buildES } from './cli-build-es'

describe('buildES config', () => {

  it('should create correct config', () => {
    const external = 'rollup'

    const configOptions = buildES({ 
      pkgName: 'aria-build', 
      entry: './src/index.ts', 
      output: 'dist', 
      external,
      sourcemap: false,
      declaration: true, 
      plugins: [], 
      format: 'es' 
    })

    console.log(configOptions)

  })

})