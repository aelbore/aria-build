import { rollup } from './libs'
import { TSRollupConfig, createTSRollupConfig } from './ts-rollup-config'
import { copyPackageFile, copyReadmeFile, renameDtsEntryFile, moveDtsFiles } from './utils'

export type BuildTSConfig = TSRollupConfig | Array<TSRollupConfig>

export async function rollupGenerate({ inputOptions, outputOptions }) {
	const bundle = await rollup(inputOptions)
	const result = await bundle.generate(outputOptions)
	return result.output
}

export async function rollupBuild({ inputOptions, outputOptions }) {
  return rollup(inputOptions).then(bundle => bundle.write(outputOptions))
}

export async function buildOutput(options: TSRollupConfig | Array<TSRollupConfig>) {
  const configs = Array.isArray(options) ? options: [ options ]
  return Promise.all(configs.map(config => {
    return rollupGenerate(createTSRollupConfig(config))
  }))
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
  await moveDtsFiles()
} 