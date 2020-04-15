import { rollup } from '../libs'

export async function rollupGenerate({ inputOptions, outputOptions }) {
	const bundle = await rollup(inputOptions)
	const result = await bundle.generate(outputOptions)
	return result.output
}