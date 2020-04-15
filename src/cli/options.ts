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
    { alias: '--external', description: 'Specify external dependencies' },
    { alias: '--name', description: 'Specify name exposed in UMD builds' },
    { alias: '--globals', description: 'Specify global dependencies' },
    { alias: '--compress', description: 'Compress or minify the output' },
    { alias: '--sourcemap', description: 'Generate sourcemap' },
    { alias: '--resolve', description: 'Resolve dependencies' },
    { alias: '--target', description: 'Target framework or library to build (i.e react or vue)' },
    { alias: '--clean', description: 'Clean the dist folder default (dist)', defaultValue: 'dist' }        
  ]
})