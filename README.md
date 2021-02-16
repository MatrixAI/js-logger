# js-logger

[![pipeline status](https://gitlab.com/MatrixAI/open-source/js-logger/badges/master/pipeline.svg)](https://gitlab.com/MatrixAI/open-source/js-logger/commits/master)

This library provies a JavaScript logger that is similar to the Python logger.

## Installation

```sh
npm install --save @matrixai/logger
```

## Development

Run `nix-shell`, and once you're inside, you can use:

```sh
# install (or reinstall packages from package.json)
npm install
# build the dist
npm run build
# run the repl (this allows you to import from ./src)
npm run ts-node
# run the tests
npm run test
# lint the source code
npm run lint
# automatically fix the source
npm run lintfix
```

### Publishing

```sh
# npm login
npm version patch # major/minor/patch
npm run build
npm publish --access public
git push
git push --tags
```
