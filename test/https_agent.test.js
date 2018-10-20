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
        setTimeout(() => {
          res.end(info.query.timeout);
        }, parseInt(info.query.timeout, 10));
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

  it('should free socket timeout', done => {
    https.get({
      agent: agentkeepalive,
      port,
      path: '/',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
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
});
