/* istanbul ignore file */

import * as url from '@rollup/plugin-url'
import * as ts from 'typescript'
import minifyHTML from 'rollup-plugin-minify-html-literals'
import json from '@rollup/plugin-json'
import MagicString from 'magic-string'

const commonjs = require('@rollup/plugin-commonjs')
const nodeResolve = require('@rollup/plugin-node-resolve')
const replacePlugin = require('@rollup/plugin-replace')

export { rollup, watch, WatcherOptions, ModuleFormat } from 'rollup'
export { commonjs, replacePlugin, json, url, nodeResolve, minifyHTML }
export { MagicString, ts }

export function terser(options?: import('rollup-plugin-terser').Options) {
  const { terser } = require('rollup-plugin-terser')
  return terser({ 
    output: { comments: false },
    ...(options ?? {})
  })
}

export * from './plugins/rollup-plugin-esbuild'