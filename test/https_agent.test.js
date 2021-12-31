'use strict';

const https = require('https');
const urlparse = require('url').parse;
const fs = require('fs');
const assert = require('assert');
const HttpsAgent = require('..').HttpsAgent;

describe('test/https_agent.test.js', () => {
  let app = null;
  let port = null;
  const agentkeepalive = new HttpsAgent({
    freeSocketTimeout: 1000,
    timeout: 2000,
    maxSockets: 5,
    maxFreeSockets: 5,
  });
  before(done => {
    app = https.createServer({
      key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
      cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
    }, (req, res) => {
      req.resume();
      if (req.url === '/error') {
        res.destroy();
        return;
      } else if (req.url === '/hang') {
        console.log('[new https request] %s %s', req.method, req.url);
        // Wait forever.
        return;
      }
      const info = urlparse(req.url, true);
      if (info.query.timeout) {
        console.log('[new https request] %s %s, query %j', req.method, req.url, info.query);
        setTimeout(() => {
          res.writeHeader(200, {
            'Content-Length': `${info.query.timeout.length}`,
          });
          res.end(info.query.timeout);
        }, parseInt(info.query.timeout));
        return;
      }
      res.end(JSON.stringify({
        info,
        url: req.url,
        headers: req.headers,
        remotePort: req.socket.remotePort,
      }));
    });
    app.listen(0, () => {
      port = app.address().port;
      done();
    });
  });

  after(done => {
    setTimeout(done, 1500);
  });

  it('should GET / success with 200 status', done => {
    https.get({
      agent: agentkeepalive,
      port,
      path: '/',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
      rejectUnauthorized: false,
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(Object.keys(agentkeepalive.sockets).length === 1);
        assert(Object.keys(agentkeepalive.freeSockets).length === 0);
        setImmediate(() => {
          assert(Object.keys(agentkeepalive.sockets).length === 0);
          assert(Object.keys(agentkeepalive.freeSockets).length === 1);
          done();
        });
      });
    });
    assert(Object.keys(agentkeepalive.sockets).length === 1);
    assert(Object.keys(agentkeepalive.freeSockets).length === 0);
  });

  it('should req handle custom timeout error', done => {
    const req = https.get({
      agent: agentkeepalive,
      port,
      path: '/?timeout=100',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
      timeout: 50,
      rejectUnauthorized: false,
    }, res => {
      console.log(res.statusCode, res.headers);
      res.resume();
      res.on('end', () => {
        done(new Error('should not run this'));
      });
    }).on('error', err => {
      assert(err);
      assert(err.message === 'socket hang up');
      done();
    });

    // node 8 don't support options.timeout on http.get
    if (process.version.startsWith('v8.')) {
      req.setTimeout(50);
    }
    req.on('timeout', () => {
      req.abort();
    });
  });

  it('should agent handle default timeout error [bugfix for node 8, 10]', done => {
    const agent = new HttpsAgent({
      freeSocketTimeout: 1000,
      timeout: 50,
      maxSockets: 5,
      maxFreeSockets: 5,
      rejectUnauthorized: false,
    });
    https.get({
      agent,
      port,
      path: '/?timeout=100',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
    }, res => {
      console.log(res.statusCode, res.headers);
      res.resume();
      res.on('end', () => {
        done(new Error('should not run this'));
      });
    }).on('error', err => {
      assert(err);
      assert(err.message === 'Socket timeout');
      done();
    });
  });

  it('should don\'t set timeout on options.timeout = 0', done => {
    const agent = new HttpsAgent({
      freeSocketTimeout: 1000,
      timeout: 0,
      maxSockets: 5,
      maxFreeSockets: 5,
      rejectUnauthorized: false,
    });
    https.get({
      agent,
      port,
      path: '/',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
    }, res => {
      res.resume();
      res.on('end', done);
    });
  });

  it('should free socket timeout', done => {
    https.get({
      agent: agentkeepalive,
      port,
      path: '/',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
      rejectUnauthorized: false,
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        process.nextTick(() => {
          assert(Object.keys(agentkeepalive.sockets).length === 0);
          assert(Object.keys(agentkeepalive.freeSockets).length === 1);
          // wait for timeout
          setTimeout(() => {
            assert(Object.keys(agentkeepalive.sockets).length === 0);
            assert(Object.keys(agentkeepalive.freeSockets).length === 0);
            done();
          }, 1500);
        });
      });
    });
    assert(Object.keys(agentkeepalive.sockets).length === 1);
  });

  it('should GET / and /foo use the same socket', done => {
    const options = {
      port,
      path: '/',
      agent: agentkeepalive,
      rejectUnauthorized: false,
    };
    let remotePort = null;
    https.get(options, res => {
      assert(res.statusCode === 200);
      let data = null;
      res.on('data', chunk => {
        data = JSON.parse(chunk);
      });
      res.on('end', () => {
        assert(data.remotePort > 0);
        assert(data.url === '/');
        remotePort = data.remotePort;

        // request again
        options.path = '/foo';
        process.nextTick(() => {
          https.get(options, res => {
            assert(res.statusCode === 200);
            let data = null;
            res.on('data', chunk => {
              data = JSON.parse(chunk);
            });
            res.on('end', () => {
              assert(data.remotePort === remotePort);
              assert(data.url === '/foo');
              process.nextTick(() => {
                assert(Object.keys(agentkeepalive.sockets).length === 0);
                assert(Object.keys(agentkeepalive.freeSockets).length === 1);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('request timeout > agent timeout', () => {
    it('should use request timeout', done => {
      const agent = new HttpsAgent({
        keepAlive: true,
        timeout: 2000,
      });
      const req = https.get({
        agent,
        port,
        path: '/?timeout=20000',
        timeout: 2500,
        rejectUnauthorized: false,
        ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
      }, res => {
        console.error(res.statusCode, res.headers);
        assert.fail('should not get res here');
      });

      let isTimeout = false;
      req.on('timeout', () => {
        isTimeout = true;
        req.abort();
      });
      req.on('error', err => {
        assert(isTimeout);
        assert(err);
        assert(err.message === 'socket hang up');
        assert(err.code === 'ECONNRESET');
        done();
      });
    });
  });
});
