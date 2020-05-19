import { extname } from 'path'
import { pathResolver } from './path-resolver'

export interface EsBuildPluginOptions {
  transformOptions?: import('esbuild').TransformOptions ,
  extensions?: string[]
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
    ...([ transformOptions.loader ]  ?? []),
    ...(options?.extensions ?? [])
  ]

  const resolveId = pathResolver(extensions)

  return {
    name: 'esbuild',
    buildStart: async () => {
      if (!service) {
        const esbuild = await import('esbuild')
        service = await esbuild.startService()
      }
    },
    resolveId,
    transform(code: string, id: string) {
      if (!extensions.includes(extname(id).slice(1)) && id.includes('node_modules')) return
      return transformCode(service, transformOptions)(code, id)
    },
    buildEnd: (error?: Error) => error && service.stop(),
    generateBundle: () => service.stop(),
    writeBundle: () => service.stop()
  }
}