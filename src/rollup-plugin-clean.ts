import { clean } from './fs'

export function cleaner(targets?: string | string[]) {
  return {
    name: 'cleaner',
    async buildStart() {
      const folders = !targets 
        ? []
        : Array.isArray(targets) ? targets: [ targets ]  

      await Promise.all(folders.map(async target => {
        await clean(target)
      }))
    }
  }
}