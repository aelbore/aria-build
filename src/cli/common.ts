import { KeyValue, PluginOptions } from '../common/common'

export const DEFAULT_OUT_DIR = 'dist'
export type OutputFormat = 'es' | 'cjs' | 'umd' | 'iife'

export interface BuildOptions {
	entry?: string
	d?: boolean
	declaration?: boolean
	format?: string
	external?: string
	name?: string
	globals?: string
	clean?: string
	sourcemap?: boolean | 'inline' | 'hidden'
	config?: string
	output?: string
	compress?: boolean | string
	resolve?: boolean | string
	watch?: boolean
	target?: string
	expirement?: boolean
	bundler?: 'esbuild' | 'swc' | 'ts'
	esbuild?: boolean
	swc?: boolean
	write?: boolean
}

export interface TestAriaConfigOptions extends Omit<AriaConfigOptions, 'test'> {
	scripts?: string[]
}

export interface AriaConfigOptions {
	external?: string[];
	plugins?: PluginOptions
	output?: {
		globals?: KeyValue
	},
	test?: TestAriaConfigOptions
}
  
export interface BuildFormatOptions extends BuildOptions {
	pkgName?: string, 
	plugins?: PluginOptions;
	dependencies?: string[]
}	