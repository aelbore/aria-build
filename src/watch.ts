import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

import { EventEmitter } from 'events'
import { stats, readdir, readFile } from './fs/fs'

const contentHash = (str: string) => crypto.createHash('md5').update(str, 'utf8').digest('hex')
const getFileStat = (file: string) => stats(file).then(stat => stat) 
const getContentHash = async (src: string) => contentHash(await readFile(src, 'utf8'))

const WATCH_EVENT = Object.freeze({
  DELETE: 'delete',
  CHANGE: 'change',
  CREATE: 'create',
  RENAME: 'rename',
  READY: 'ready'
})

const log = (msg: string) => console.log(msg)

interface Listener {
  (file?: string, stats?: fs.Stats): void
}

interface ReadyListener {
  (files: string[]): void
}

interface WatchOptions {
  onChange?: Listener;
  onCreate?: Listener;
  onDelete?: Listener;
  onReady?: ReadyListener; 
}

class Watcher extends EventEmitter {

  private watchers = new Map()
  private store = new Map()

  constructor(options: WatchOptions = {}) {
    super()
    const keys = Object.keys(options)
    keys.forEach(key => {
      const event = key.toLowerCase().replace('on', '')
      this.on(event, options[key])
    })
  }

  get watchFiles() {
    return Array.from(this.watchers.keys())
  }

  public async watch(src: string) {
    let fsWait = false;
    const stats = await getFileStat(src)

    if (stats.isDirectory()) {
      this.store.set(src, stats)
      const files = await readdir(src)
      await Promise.all(files.map(async file => {
        await this.watch(path.join(src, file))
      }))
    }

    if (stats.isFile()) {
      this.store.set(src, await getContentHash(src))
    }

    const unwatch = (event: string, filename: string) => {
      const file = path.join(src, filename)
      if (event.includes(WATCH_EVENT.RENAME) && this.store.has(file) && !fs.existsSync(file)) {
        this.unwatch(file)
      }
    }

    const isDirectory = async (src: string, fsStat: fs.Stats) => {
      if (fsStat.isDirectory()) {
        if (!this.store.has(src)) {
          this.emit(WATCH_EVENT.CREATE, src, fsStat)
        }
        const files = await readdir(src)
        await Promise.all(files.map(async file => {
          const dirFile = path.join(src, file)
          if (!this.store.has(dirFile)) {
            await this.watch(dirFile)
            this.emit(WATCH_EVENT.CREATE, file, await getFileStat(dirFile))
          }
        }))
      }
    }

    const isFile = async (src: string, fsStat: fs.Stats) => {
      if (fsStat.isFile()) {
        const currentContent = await getContentHash(src)
        if (this.store.get(src) !== currentContent) {
          this.store.set(src, currentContent)
          this.emit(WATCH_EVENT.CHANGE, src, fsStat)
        }
      }
    }

    const watchCallback = async (event: string, filename: string) => {
      unwatch(event, filename)
      if (fs.existsSync(src)) {
        if (fsWait) return;
          
        /// @ts-ignore
        fsWait = setTimeout(() => fsWait = false, 100);

        const fsStat = await getFileStat(src)
        await isDirectory(src, fsStat)
        await isFile(src, fsStat)
      }
    }

    this.watchers.set(src, fs.watch(src, watchCallback))
  }

  public async unwatch(src: string) {
    if (this.watchers.has(src)) {
      const keys = Array.from(this.watchers.keys()).filter(key => key.includes(src))
      await Promise.all(keys.map(key => {
        const watcher = this.watchers.get(src) as fs.FSWatcher
        watcher.close()
        this.watchers.delete(src)
        this.emit(WATCH_EVENT.DELETE, src)
      }))
    }
  }

}

const watcher = async (src: string, 
  options: WatchOptions = {
    onReady: (files: string[]) => log(`> Initial scan complete. Ready for changes. Total files: ${files.length}`)
  }) => {
  const watcher = new Watcher(options)
  await watcher.watch(src)
  watcher.emit('ready', watcher.watchFiles)
}

export { watcher, WatchOptions, Listener, ReadyListener }