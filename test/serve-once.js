'use strict';

const fs = require('fs');

const test = require('supertape');
const tryCatch = require('try-catch');
const pullout = require('pullout');

const serveOnce = require('..');

test('serve-once: no middleware', (t) => {
    const [e] = tryCatch(serveOnce);
    
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

test('serve-once: fetch: head', async (t) => {
    const middleware = () => {
        return (req, res) => {
            res.end('hello');
        };
    };
    
    const {request} = serveOnce(middleware);
    const response = await request.head('/');
    
    t.ok(response, 'should return response');
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
        return (req, res) => {
            res.end();
        };
    };
    
    const {request} = serveOnce(middleware);
    const {status} = await request.get('/');
    
    t.deepEqual(status, 200, 'should equal');
    t.end();
});

test('serve-once: fetch: type: stream', async (t) => {
    const middleware = () => (req, res) => {
        res.end('hello');
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.get('/', {
        type: 'stream',
    });
    
    const result = await pullout(body, 'string');
    
    t.equal(result, 'hello', 'should equal');
    t.end();
});

test('serve-once: fetch: type: json', async (t) => {
    const middleware = () => (req, res) => {
        res.end('[1, 2]');
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.get('/', {
        type: 'json',
    });
    
    t.deepEqual(body, [1, 2], 'should equal');
    t.end();
});

test('serve-once: fetch: type: json', async (t) => {
    const middleware = () => (req, res) => {
        res.end('a');
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.get('/', {
        type: 'buffer',
    });
    
    t.deepEqual(body, Buffer.from('a'), 'should equal');
    t.end();
});

test('serve-once: fetch: headers', async (t) => {
    const middleware = () => (req, res) => {
        res.json(req.headers);
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.get('/', {
        headers: {
            authorization: 'basic',
        },
        type: 'json',
    });
    
    const {authorization} = body;
    
    t.deepEqual(authorization, 'basic', 'should equal');
    t.end();
});

test('serve-once: post', async (t) => {
    const middleware = () => async (req, res) => {
        if (req.method === 'POST') {
            const data = await pullout(req, 'string');
            res.end(data);
            return;
        }
        
        res.end('error');
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.post('/', {
        body: 'ok',
    });
    
    t.deepEqual(body, 'ok', 'should equal');
    t.end();
});

test('serve-once: fetch: put: stream', async (t) => {
    const middleware = () => async (req, res) => {
        const data = await pullout(req);
        res.send(data);
    };
    
    const {request} = serveOnce(middleware);
    const {body} = await request.put('/', {
        body: fs.createReadStream(__filename),
    });
    
    const data = fs.readFileSync(__filename, 'utf8');
    
    t.equal(body, data, 'should equal');
    t.end();
});

