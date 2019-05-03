import { rollup } from './libs'
import { TSRollupConfig, createTSRollupConfig } from './ts-rollup-config';
import { copyPackageFile, copyReadmeFile, renameDtsEntryFile } from './utils';

export async function rollupBuild({ inputOptions, outputOptions }) {
  return rollup(inputOptions).then(bundle => bundle.write(outputOptions));
}

export async function build(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = Array.isArray(options) ? options: [ options ]
  return Promise.all(configs.map(config => {
    return rollupBuild(createTSRollupConfig(config))
  }))
}

export async function bundle(options: TSRollupConfig | Array<TSRollupConfig>) {
  await build(options)
  await Promise.all([ copyPackageFile(), copyReadmeFile(), renameDtsEntryFile(options) ])
}