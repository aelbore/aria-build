import * as url from '@rollup/plugin-url'
import * as ts from 'typescript'
import minifyHTML from 'rollup-plugin-minify-html-literals'
import json from '@rollup/plugin-json'
import MagicString from 'magic-string'

const commonjs = require('@rollup/plugin-commonjs')
const nodeResolve = require('@rollup/plugin-node-resolve')
const multiEntry = require('@rollup/plugin-multi-entry')
const typescript2 = require('rollup-plugin-typescript2')
const replacePlugin = require('@rollup/plugin-replace')

export { rollup } from 'rollup'
export { terser } from 'rollup-plugin-terser'
export { commonjs, replacePlugin, json, url, nodeResolve, typescript2, minifyHTML, multiEntry }
export { MagicString, ts }