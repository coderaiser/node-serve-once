'use strict';

const http = require('http');
const {promisify} = require('util');

const express = require('express');
const fetch = require('node-fetch');
const merge = require('webpack-merge');

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
    
    const res = await fetch(url, fetchOptions);
    
    if (type === 'string')
        await addBodyStr(res);
    
    if (type === 'json')
        await addBodyJson(res);
    
    if (type === 'buffer')
        await addBodyBuffer(res);
    
    await close();
    
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
        serve: bind(serve, middle),
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
    const value = await res.buffer();
    
    Object.defineProperty(res, 'body', {
        value,
    });
}
