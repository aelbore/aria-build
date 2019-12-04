cd packages/aria-fs
git reset --hard

cd ../../
cd packages/aria-mocha
git reset --hard

cd ../../
cd packages/lit-element-transpiler
git reset --hard

cd ../../
cd packages/rollup-plugin-inline-lit-element
git reset --hard

git submodule update
git submodule update --remote