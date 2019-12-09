git submodule init && \
git submodule update --remote && \

cd packages/aria-fs && \
npm install && \

cd ../../ && \
cd packages/aria-mocha && \
npm install && \
npm run build && \

cd ../../ && \
cd packages/lit-element-transpiler && \
npm install && \
npm run build && \

cd ../../ && \
cd packages/rollup-plugin-inline-lit-element && \
npm install && \
npm run build && \

cd ../../ && \
aria-fs link ./packages/aria-mocha/dist ./packages/aria-fs/node_modules/aria-mocha && \
aria-fs link ./packages/aria-mocha/dist ./packages/lit-element-transpiler/node_modules/aria-mocha && \
npm run build && \

npm test --prefix ./packages/aria-fs/ && \
npm test --prefix ./packages/aria-mocha/ && \
npm test --prefix ./packages/lit-element-transpiler/ && \

npm test && \

sh ./reset-packages.sh && \

git submodule update