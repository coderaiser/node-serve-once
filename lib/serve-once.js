'use strict';

const http = require('http');
const {promisify} = require('util');

const zames = require('zames');
const express = require('express');
const fetch = require('node-fetch');
const pullout = promisify(require('pullout'));

const getURL = (port, path, prefix) => `http://127.0.0.1:${port}${prefix}${path}`;

const serve = zames((middleware, options, fn) => {
    const app = express();
    const server = http.createServer(app);
    
    app.use(middleware(options));
    
    const close = promisify((cb) => {
        server.close(cb);
    });
    
    server.listen(() => {
        const {port} = server.address();
        
        fn(null, {
            port,
            close,
        });
    });
});

const bind = (f, a) => f.bind(null, a);
const {stringify} = JSON;

const request = (middleware, defaults = {}) => async (method, path, {body, options} = {}) => {
    const {port, close} = await serve(middleware, {
        ...defaults,
        ...options,
    });
    
    options = options || {};
    const prefix = options.prefix || '';
    const url = getURL(port, path, prefix);
    
    const fetchOptions = {
        method,
    };
    
    if (body)
        fetchOptions.body = parseBody(body);
    
    const res = await fetch(url, fetchOptions);
    
    const resBody = await pullout(res.body, 'string');
    await close();
    
    return {
        ...res,
        body: resBody,
    };
};

module.exports = (middle, options) => {
    check(middle);
    
    const req = request(middle, options);
    
    req.get = bind(req, 'get');
    req.put = bind(req, 'put');
    req.delete = bind(req, 'delete');
    
    return {
        request: req,
        serve: bind(serve, middle, options),
    }
};

function check(middle) {
    if (typeof middle !== 'function')
        throw Error('middleware should be a function!');
}

function parseBody(body) {
    if (typeof body === 'string')
        return body;
    
    return stringify(body);
}
