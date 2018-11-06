'use strict';

const {
    promisify,
} = require('util');

const test = require('tape');
const tryCatch = require('try-catch');
const pullout = promisify(require('pullout'));

const serveOnce = require('..');

test('serve-once: no middleware', (t) => {
    const [e] = tryCatch(serveOnce)
    
    t.equal(e.message, 'middleware should be a function!', 'should equal');
    t.end();
});

test('serve-once: fetch: get', async (t) => {
    const middleware = () => {
        return (req, res) => {
            res.end('hello');
        };
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.get('/');
    
    t.equal(body, 'hello', 'should equal');
    t.end();
});

test('serve-once: fetch: put: string', async (t) => {
    const middleware = () => {
        return async (req, res) => {
            const data = await pullout(req, 'string');
            res.end(data);
        };
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.put('/', {
        body: 'hello',
    });
    
    t.equal(body, 'hello', 'should equal');
    t.end();
});

test('serve-once: fetch: put', async (t) => {
    const middleware = () => {
        return async (req, res) => {
            const data = await pullout(req, 'string');
            
            res.end(data);
        };
    };
    
    const data = [1, 2];
    const {request} = serveOnce(middleware);
    const {body} = await request.put('/', {
        body: data,
    });
    
    const result = JSON.parse(body);
    
    t.deepEqual(result, data, 'should equal');
    t.end();
});

test('serve-once: fetch: get', async (t) => {
    const middleware = (config) => {
        return (req, res) => {
            res.end(JSON.stringify(config));
        };
    };
    
    const {request} = serveOnce(middleware, {
        a: 1,
    });
    
    const options = {
        b: 2,
    };
    
    const {body} = await request.get('/', {options});
    const result = JSON.parse(body);
    
    const expected = {
        a: 1,
        b: 2,
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('serve-once: fetch: status', async (t) => {
    const middleware = () => {
        return async (req, res) => {
            res.end();
        };
    };
    
    const {request} = serveOnce(middleware);
    const {status} = await request.get('/');
    
    t.deepEqual(status, 200, 'should equal');
    t.end();
});
