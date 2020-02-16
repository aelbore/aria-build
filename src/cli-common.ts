export const DEFAULT_OUT_DIR = 'dist'

export type PluginOptions = any[] | PluginBeforeAfter
export type OutputFormat = 'es' | 'cjs' | 'umd' | 'iife'

export interface BuildOptions {
	entry?: string;
	declaration?: boolean;
	format?: string;
	external?: string;
	name?: string;
	globals?: string;
	clean?: string;
	sourcemap?: boolean | string;
	config?: string;
	output?: string;
	compress?: boolean | string;
	resolve?: boolean | string;
	watch?: boolean
}

export interface PluginBeforeAfter {
	before?: any[];
	after?: any[];
}

export interface KeyValue {
	[key: string]: string;
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