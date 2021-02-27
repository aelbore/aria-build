/* istanbul ignore file */

import * as ts from 'typescript'
import minifyHTML from 'rollup-plugin-minify-html-literals'
import MagicString from 'magic-string'
import * as rollup$ from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'

const replacePlugin = require('@rollup/plugin-replace')

export type WatcherOptions = import('rollup').WatcherOptions
export type ModuleFormat = import('rollup').ModuleFormat

export const rollup = rollup$.rollup
export const watch = rollup$.watch

export { replacePlugin, nodeResolve, minifyHTML }
export { MagicString, ts }

export function commonjs(options?: import('@rollup/plugin-commonjs').RollupCommonJSOptions) {
  const common = require('@rollup/plugin-commonjs')
  return common(options)
}

export function terser(options?: import('rollup-plugin-terser').Options) {
  const { terser } = require('rollup-plugin-terser')
  return terser({ 
    output: { comments: false },
    ...(options ?? {})
  })
}