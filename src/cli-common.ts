export const DEFAULT_OUT_DIR = 'dist'

export interface BuildOptions {
	entry?: string;
	declaration?: boolean;
	format?: string;
	external?: string;
	plugins?: PluginOptions;
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

export type PluginOptions = any[] | PluginBeforeAfter
export type OutputFormat = 'es' | 'cjs' | 'umd'

export interface KeyValue {
	[key: string]: string;
}

export interface AriaConfigOptions {
	external?: string[];
	plugins?: PluginOptions
	output?: {
		globals?: KeyValue
	},
	test?: Omit<AriaConfigOptions, 'test'>
}
  
export interface BuildFormatOptions extends BuildOptions {
	pkgName?: string, 
	dependencies?: string[]
}	