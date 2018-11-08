Serve Once [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]
=========

Serve express middleware once.

1. creates http server on a free port
2. uses passed express middleware
3. serve exectly 1 request
4. closes http server
5. [pullout](https://github.com/coderaiser/pullout) body of request stream
6. resolves request promise with a response

Good for middleware logic testing.

## Install

```
npm i serve-once
```

## API

### request(method, path[ {options, body, type = 'string'}])

- **method** - `http`-method (`get`, `put`, `post` etc)
- **path** - `http`-path
- **options** - middleware options
- **body** - `http`-request `body`
- **type** - type of return value, can be:
  - string
  - json
  - stream

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
```

You can send body:

```js
const pullout = require('pullout');
const putMiddleware = () => async (req, res) => {
    const body = await pullout(req);
    res.end(body);
};

const {request} = require('serve-once')(putMiddleware);
const {body} = await request.put('/', {
    body: [1, 2, 3],
});

console.log(JSON.parse(body));
// returns
[1, 2, 3]
```

You can use default options:

```js
// default options
const middleware = (options) => (req, res) => {
    res.end(JSON.stringify(options));
};

const {request} = require('serve-once')(middleware, {
    a: 1,
});

const options = {
    b: 2,
};

const {body} = await request.get('/', {options});
JSON.parse(body);
// returns
{
    a: 1,
    b: 2,
}
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

