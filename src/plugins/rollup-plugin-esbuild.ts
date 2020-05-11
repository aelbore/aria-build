import { dirname, extname, join, resolve } from 'path'
import { existsSync } from 'fs'

export interface EsBuildPluginOptions {
  transformOptions?: import('esbuild').TransformOptions ,
  extensions?: string[]
}

export function resolveId(extensions: string[]) {   
  return function (id: string, origin: string | undefined) {
    const basePath = origin ? dirname(origin): resolve()
    for (const ext of extensions) {
      const file = join(basePath, extname(id) ? id: `${id}.${ext}`)
      if (existsSync(file)) {
        return file
      }
    }
  }
}

export function transform(service: import('esbuild').Service, options?: import('esbuild').TransformOptions) {
  return async function (code: string, id: string) {
    const result = await service.transform(code, { 
      loader: extname(id).slice(1) as import('esbuild').Loader,
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
    ...(options.extensions ?? [])
  ]

  return {
    name: 'esbuild',
    buildStart: async () => {
      const esbuild = await import('esbuild')
      service = await esbuild.startService()
    },
    resolveId: resolveId(extensions),
    transform: transform(service, transformOptions),
    buildEnd: (error?: Error) => error && service.stop(),
    generateBundle: () => service.stop()
  }
}