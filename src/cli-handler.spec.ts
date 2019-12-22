import * as pkgJson from '../package.json'
import * as assert from 'assert'
import * as mock from 'mock-fs';
import { BuildOptions, DEFAULT_OUT_DIR } from './cli-common';
import { handler } from './cli-handler';

describe('CLI [handler]', () => {

  beforeEach(() => {

  })

  afterEach(() => {
    mock.restore()
  })

  it('should build the input', async () => {
    // const options: BuildOptions = {
    //   declaration: false,
    //   format: 'es,cjs',
    //   output: DEFAULT_OUT_DIR,
    //   clean: DEFAULT_OUT_DIR,
    //   sourcemap: false,
    //   compress: false
    // }

    // await handler(options)
  })

})