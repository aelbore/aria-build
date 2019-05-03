
const commonjs = require('rollup-plugin-commonjs')
const typescript2 = require('rollup-plugin-typescript2')
const nodeResolve = require('rollup-plugin-node-resolve')

export { rollup } from 'rollup'
export { terser } from 'rollup-plugin-terser'
export { commonjs, nodeResolve, typescript2 }