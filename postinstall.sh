git submodule init
git submodule update --remote

cd packages/aria-fs
npm install

cd ../../
cd packages/aria-mocha
npm install

cd ../../
cd packages/lit-element-transpiler
npm install

cd ../../
cd packages/rollup-plugin-inline-lit-element
npm install

cd ../../
npm run build

npm run build.packages

npm test --prefix ./packages/aria-fs/
npm test --prefix ./packages/aria-mocha/
npm test --prefix ./packages/lit-element-transpiler/

npm test