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
}
  
export interface BuildFormatOptions extends BuildOptions {
	pkgName?: string, 
	dependencies?: string[]
}	