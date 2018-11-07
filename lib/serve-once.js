'use strict';

const http = require('http');
const {promisify} = require('util');

const express = require('express');
const fetch = require('node-fetch');
const pullout = promisify(require('pullout'));
const merge = require('webpack-merge');
const currify = require('currify');

const getURL = (port, path, prefix) => `http://127.0.0.1:${port}${prefix}${path}`;

const serve = currify(async (middleware, options) => {
    const app = express();
    const server = http.createServer(app);
    
    app.use(middleware(options));
    
    const close = promisify(server.close.bind(server));
    const listen = promisify(server.listen.bind(server));
    
    await listen();
    const {port} = server.address();
    
    return {
        port,
        close,
    };
});

const bind = (f, a) => f.bind(null, a);
const {stringify} = JSON;

const request = (middleware, defaults = {}) => async (method, path, {body, options} = {}) => {
    options = options || {};
    
    const {port, close} = await serve(middleware, merge(defaults, options));
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
    
    Object.defineProperty(res, 'body', {
        value: resBody,
    });
    
    return res;
};

module.exports = (middle, options) => {
    check(middle);
    
    const req = request(middle, options);
    
    req.get = bind(req, 'get');
    req.put = bind(req, 'put');
    req.delete = bind(req, 'delete');
    req.patch = bind(req, 'patch');
    
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
