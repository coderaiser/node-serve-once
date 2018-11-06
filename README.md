Serve Once [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]
=========

Serve express middleware once.

## Install

```
npm i serve-once
```

## API

```js
const middleware = (options = 'hello') => (req, res) => {
    res.end(JSON.stringify(options));
};

const {request} = require('serve-once')(middleware);

await request('get', '/');
// returns
'hello'

await request.get('/', {
    options: 'any'
});
// returns
'any'

const pullout = require('pullout');
const putMiddleware = () => callbackify(async (req, res) => {
    const body = pullout(req);
    res.end(body);
});

const {request} = require('serve-once')(putMiddleware);
const {body} = await request.put('/', {
    body: [1, 2, 3],
    options: 'any'
});

console.log(JSON.parse(body));
// returns
[1, 2, 3]

```

## License
MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/serve-once.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/node-serve-once/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/node-serve-once.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/node-serve-once/badge.svg?branch=master&service=github
[NPMURL]:                   https://npmjs.org/package/serve-once "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/node-serve-once  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/node-serve-once "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]:              https://coveralls.io/github/coderaiser/node-serve-once?branch=master

