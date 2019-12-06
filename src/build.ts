import { rollup } from './libs'
import { TSRollupConfig, createTSRollupConfig } from './ts-rollup-config';
import { copyPackageFile, copyReadmeFile, renameDtsEntryFile, moveDtsFiles } from './utils';
import { settle } from './settle'

export async function rollupBuild({ inputOptions, outputOptions }) {
  return rollup(inputOptions).then(bundle => bundle.write(outputOptions));
}

export async function build(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = Array.isArray(options) ? options: [ options ]
  return settle(configs.map(config => {
    return rollupBuild(createTSRollupConfig(config))
  }))
}

export async function bundle(options: TSRollupConfig | Array<TSRollupConfig>) {
  await build(options)
  await settle([ copyPackageFile(), copyReadmeFile(), renameDtsEntryFile(options) ])
  await moveDtsFiles()
} 