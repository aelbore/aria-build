/* istanbul ignore file */

export const getCliOptions = () => ({
  package: 'aria-build',
  command: 'build',
  options: [
    { alias: '-i, --entry', description: 'Entry modules' },
    { alias: '-d, --declaration', description: 'Generates corresponding .d.ts file', defaultValue: false },
    { alias: '-f, --format', description: 'Build specified formats', defaultValue: 'es,cjs' },
    { alias: '-o, --output', description: 'Directory to place build files into', defaultValue: 'dist' },
    { alias: '-c, --config', description: 'config file of aria-build. i.e aria.config.ts' },
    { alias: '-w, --watch', description: 'Rebuilds on any change  (default false)', defaultValue: false },
    { alias: '--dts-only', description: 'Generate Declation types only', defaultValue: false },
    { alias: '--external', description: 'Specify external dependencies', defaultValue: '' },
    { alias: '--name', description: 'Specify name exposed in UMD builds' },
    { alias: '--globals', description: 'Specify global dependencies' },
    { alias: '--compress', description: 'Compress or minify the output' },
    { alias: '--sourcemap', description: 'Generate sourcemap', defaultValue: false },
    { alias: '--resolve', description: 'Resolve dependencies' },
    { alias: '--target', description: 'Target framework or library to build (i.e react or vue)' },
    { alias: '--clean', description: 'Clean the dist folder default (dist)', defaultValue: 'dist' },
    { alias: '--write', description: 'Write the output to disk default to true', defaultValue: true },
    { alias: '--bundler', description: 'Bundler to enabled default (esbuild), esbuild | swc | ts', defaultValue: 'esbuild' },
    { alias: '--esbuild', description: 'Enabled esbuild plugin to use transform ts,js,jsx,tsx' },
    { alias: '--swc', description: 'Enabled swc plugin to transform ts,js,jsx,tsx' }            
  ]
})