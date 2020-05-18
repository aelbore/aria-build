import { dirname, extname, join } from 'path'
import { existsSync, statSync } from 'fs'

export interface EsBuildPluginOptions {
  transformOptions?: import('esbuild').TransformOptions ,
  extensions?: string[]
}

export function resolveId(extensions: string[]) {   
  const resolveFile = (resolved: string, index: boolean = false) => {
    for (const extension of extensions) {
      const file = index 
        ? join(resolved, `index.${extension}`)
        : `${resolved}.${extension}`
      if (existsSync(file)) return file
    }
    return null
  }
  return function (id: string, origin: string | undefined) {
    if (!origin) return id
    const resolved = join(dirname(origin), id)
    const file = resolveFile(resolved)
    if (file) return file
    if (existsSync(resolved) && statSync(resolved).isDirectory()) {
      const coreFile = resolveFile(resolved, true)
      if (coreFile) return coreFile
    }
  }
}

export function transformCode(service: import('esbuild').Service, options?: import('esbuild').TransformOptions) {
  return async function (code: string, id: string) {
    const result = await service.transform(code, { 
      loader: extname(id).slice(1) as import('esbuild').Loader,
      target: 'es2018',
      sourcemap: true,
      ...(options ?? {})
    })
    return {
      code: (result.js ?? '').replace(/\/\/# sourceMappingURL.*/, ''),
      map: result.jsSourceMap
    }
  }
}

/* istanbul ignore next */
export function esBuildPlugin(options?: EsBuildPluginOptions) { 
  let service: import('esbuild').Service = undefined
  
  const transformOptions = options?.transformOptions ?? {}
  const extensions = [ 
    'ts', 'js', 'tsx', 'jsx', 
    ...([ transformOptions.loader ]  ?? []),
    ...(options?.extensions ?? [])
  ]

  return {
    name: 'esbuild',
    buildStart: async () => {
      if (!service) {
        const esbuild = await import('esbuild')
        service = await esbuild.startService()
      }
    },
    resolveId: resolveId(extensions),
    transform(code: string, id: string) {
      if (!extensions.includes(extname(id).slice(1)) && id.includes('node_modules')) return
      return transformCode(service, transformOptions)(code, id)
    },
    buildEnd: (error?: Error) => error && service.stop(),
    generateBundle: () => service.stop(),
    writeBundle: () => service.stop()
  }
}