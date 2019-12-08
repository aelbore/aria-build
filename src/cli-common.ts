export const DEFAULT_OUT_DIR = 'dist'

export interface BuildOptions {
	entry?: string;
	declaration?: boolean;
	format?: string;
	external?: string;
	plugins?: any[];
	name?: string;
	globals?: string;
	clean?: string;
	sourcemap?: boolean;
	config?: string;
	output?: string;
	compress?: boolean;
}

export interface KeyValue {
	[key: string]: string;
}

export interface AriaConfigOptions {
	plugins?: any[];
	output?: {
		globals?: KeyValue
	}
}
  
export interface BuildFormatOptions extends BuildOptions {
	pkgName?: string, 
	dependencies?: string[]
}	