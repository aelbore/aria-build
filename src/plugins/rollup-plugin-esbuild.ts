import { extname } from 'path'
import { transform } from 'esbuild'

export interface EsBuildPluginOptions {
  transformOptions?: import('esbuild').TransformOptions
  extensions?: string[]
}

export function transformCode(options?: import('esbuild').TransformOptions) {
  return async function (code: string, id: string) {
    const result = await transform(code, { 
      loader: extname(id).slice(1) as import('esbuild').Loader,
      target: 'es2018',
      sourcemap: true,
      sourcefile: id,
      ...(options || {})
    })
    return {
      code: (result.code || '').replace(/\/\/# sourceMappingURL.*/, ''),
      map: result.map
    }
  }
}

/* istanbul ignore next */
export function esBuildPlugin(options?: EsBuildPluginOptions) {   
  const transformOptions = options?.transformOptions ?? {}
  const extensions = [ 
    ...([ transformOptions.loader ]  ?? []),
    ...(options?.extensions ?? [])
  ]

  return {
    name: 'esbuild',
    transform(code: string, id: string) {
      if (!extensions.includes(extname(id).slice(1)) && id.includes('node_modules')) return
      return transformCode(transformOptions)(code, id)
    }
  }
}