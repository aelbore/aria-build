import { clean } from './fs'
import { settle } from './settle'

export function cleaner(targets?: string | string[]) {
  return {
    name: 'cleaner',
    async buildStart() {
      const folders = !targets 
        ? []
        : Array.isArray(targets) ? targets: [ targets ]  

      await settle(folders.map(async target => {
        await clean(target)
      }))
    }
  }
}