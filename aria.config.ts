import { copy } from './src'

export default {
  plugins: {
    after: [
      copy({
        targets: [
          { src: 'bin/*', dest: 'dist/bin' } 
        ]
      })
    ]
  }
}