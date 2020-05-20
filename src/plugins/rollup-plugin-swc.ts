/* istanbul ignore file */

export function swcPlugin(options?: import('@swc/core').JscConfig) {
  let swc: typeof import('@swc/core')

  const jsc: import('@swc/core').JscConfig = {
    parser: {
      syntax: 'typescript',
      decorators: true,
      dynamicImport: true,
      tsx: true
    },
    target: 'es2019',
    ...(options ?? {})
  }

  return {
    name: 'aria-swc',
    buildStart: async () => {
      swc = await import('@swc/core')
    },
    transform(code: string, id: string) {
      return swc.transform(code, { filename: id, sourceMaps: true, jsc })
    }
  }
}