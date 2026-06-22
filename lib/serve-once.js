'use strict';

const http = require('node:http');
const {promisify} = require('node:util');
const {Readable} = require('node:stream');

const pullout = require('pullout');
const express = require('express');
const {merge} = require('webpack-merge');
const {defineProperty} = Object;
const isFn = (a) => typeof a === 'function';
const isString = (a) => typeof a === 'string';
const getURL = (port, path) => `http://127.0.0.1:${port}${path}`;

const serve = async (middleware, options) => {
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
};

const bind = (f, a) => f.bind(null, a);
const {stringify} = JSON;

const request = (middleware, defaults = {}) => async (method, path, config) => {
    config = config || {};
    
    const {
        body,
        
        headers,
                options = {},
        type = 'string',
    } = config;
    
    const {port, close} = await serve(middleware, merge(defaults, options));
    const url = getURL(port, path);
    
    const fetchOptions = {
        method,
        headers,
    };
    
    if (body)
        fetchOptions.body = parseBody(body);
    
    fetchOptions.duplex = 'half';
    
    const res = await fetch(url, fetchOptions);
    
    if (type === 'string')
        await addBodyStr(res);
    else if (type === 'json')
        await addBodyJson(res);
    else if (type === 'buffer')
        await addBodyBuffer(res);
    else
        defineProperty(res, 'body', {
            value: Readable.fromWeb(res.body),
        });
    
    await close();
    
    return res;
};

module.exports = (middle, options) => {
    check(middle);
    
    const req = request(middle, options);
    
    req.get = bind(req, 'GET');
    req.head = bind(req, 'HEAD');
    req.put = bind(req, 'PUT');
    req.post = bind(req, 'POST');
    req.delete = bind(req, 'DELETE');
    req.patch = bind(req, 'PATCH');
    
    return {
        request: req,
        serve: bind(serve, middle),
    };
};

function check(middle) {
    if (!isFn(middle))
        throw Error('middleware should be a function!');
}

function parseBody(body) {
    if (isString(body))
        return body;
    
    if (body instanceof Readable)
        return body;
    
    return stringify(body);
}

async function addBodyStr(res) {
    const value = await res.text();
    
    Object.defineProperty(res, 'body', {
        value,
    });
}

async function addBodyJson(res) {
    const value = await res.json();
    
    Object.defineProperty(res, 'body', {
        value,
    });
}

async function addBodyBuffer(res) {
    const value = await pullout(res.body, 'buffer');
    
    Object.defineProperty(res, 'body', {
        value,
    });
}
