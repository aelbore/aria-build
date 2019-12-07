import * as assert from 'assert'
import * as mock from 'mock-fs';
import { getPackageJson } from './utils';

describe('utils', () => {
  let pkgJson: any;
  
  beforeEach(() => {
    pkgJson = {
      "name": "aria-build",
    }

    mock({
      'package.json': JSON.stringify(pkgJson)
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('should read the package.json file', () => {
    const pkg = getPackageJson();
    assert.strictEqual(pkg.name, pkgJson.name);
  })

})