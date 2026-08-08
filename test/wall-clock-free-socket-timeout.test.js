'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const assert = require('assert');
const Agent = require('..');
const HttpsAgent = require('..').HttpsAgent;
const {
  SOCKET_ENTER_FREE_POOL_TIME,
} = require('../lib/constants');

describe('test/wall-clock-free-socket-timeout.test.js', () => {
  let app;
  let port;

  before(done => {
    app = http.createServer((req, res) => {
      res.end('ok');
    });
    app.listen(0, () => {
      port = app.address().port;
      done();
    });
  });

  after(done => {
    app.close(done);
  });

  it('should stamp SOCKET_ENTER_FREE_POOL_TIME when socket enters free pool', done => {
    const agent = new Agent({
      keepAlive: true,
      testOnBorrow: true,
      freeSocketTimeout: 5000,
    });

    http.get({ agent, port, path: '/' }, res => {
      const socket = res.socket;
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          assert(socket[SOCKET_ENTER_FREE_POOL_TIME] > 0,
            'should have a positive timestamp');
          assert(Date.now() - socket[SOCKET_ENTER_FREE_POOL_TIME] < 5000,
            'timestamp should be recent (within 5s to tolerate slow CI)');
          agent.destroy();
          done();
        });
      });
    });
  });

  it('should reuse socket when idle time is within threshold', done => {
    const agent = new Agent({
      keepAlive: true,
      testOnBorrow: true,
      freeSocketTimeout: 5000,
    });

    http.get({ agent, port, path: '/' }, res => {
      const socket1 = res.socket;
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          http.get({ agent, port, path: '/' }, res2 => {
            assert.strictEqual(res2.socket, socket1,
              'should reuse the socket when idle time is within threshold');
            res2.resume();
            res2.on('end', () => {
              agent.destroy();
              done();
            });
          });
        });
      });
    });
  });

  it('should destroy socket when idle time exceeds freeSocketTimeout (simulated freeze)', done => {
    const agent = new Agent({
      keepAlive: true,
      testOnBorrow: true,
      freeSocketTimeout: 1000,
    });

    http.get({ agent, port, path: '/' }, res => {
      const socket1 = res.socket;
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          // Simulate a Lambda freeze by setting the timestamp far in the past
          socket1[SOCKET_ENTER_FREE_POOL_TIME] = Date.now() - 10000;

          http.get({ agent, port, path: '/' }, res2 => {
            // addRequest purges stale sockets before selecting, so a new socket is created
            assert.notStrictEqual(res2.socket, socket1,
              'should not reuse stale socket');
            assert(socket1.destroyed, 'stale socket should be destroyed');
            res2.resume();
            res2.on('end', () => {
              agent.destroy();
              done();
            });
          });
        });
      });
    });
  });

  it('should handle multiple stale sockets in the pool', done => {
    const agent = new Agent({
      keepAlive: true,
      testOnBorrow: true,
      freeSocketTimeout: 1000,
      maxSockets: 5,
      maxFreeSockets: 5,
    });

    let completed = 0;
    const sockets = [];

    function onComplete() {
      completed++;
      if (completed < 2) return;

      setImmediate(() => {
        assert.strictEqual(sockets.length, 2);
        assert(sockets[0][SOCKET_ENTER_FREE_POOL_TIME] > 0);
        assert(sockets[1][SOCKET_ENTER_FREE_POOL_TIME] > 0);

        // Simulate freeze
        sockets.forEach(s => {
          s[SOCKET_ENTER_FREE_POOL_TIME] = Date.now() - 5000;
        });

        // addRequest will purge both stale sockets and create a new connection
        http.get({ agent, port, path: '/' }, res => {
          assert.notStrictEqual(res.socket, sockets[0],
            'should not reuse first stale socket');
          assert.notStrictEqual(res.socket, sockets[1],
            'should not reuse second stale socket');
          assert(sockets[0].destroyed, 'first stale socket should be destroyed');
          assert(sockets[1].destroyed, 'second stale socket should be destroyed');
          res.resume();
          res.on('end', () => {
            agent.destroy();
            done();
          });
        });
      });
    }

    http.get({ agent, port, path: '/' }, res => {
      sockets.push(res.socket);
      res.resume();
      res.on('end', onComplete);
    });

    http.get({ agent, port, path: '/' }, res => {
      sockets.push(res.socket);
      res.resume();
      res.on('end', onComplete);
    });
  });

  it('should not destroy socket when freeSocketTimeout is 0 (disabled)', done => {
    const agent = new Agent({
      keepAlive: true,
      testOnBorrow: true,
      freeSocketTimeout: 0,
    });

    http.get({ agent, port, path: '/' }, res => {
      const socket1 = res.socket;
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          socket1[SOCKET_ENTER_FREE_POOL_TIME] = Date.now() - 999999;

          http.get({ agent, port, path: '/' }, res2 => {
            assert.strictEqual(res2.socket, socket1,
              'should reuse when freeSocketTimeout is disabled');
            res2.resume();
            res2.on('end', () => {
              agent.destroy();
              done();
            });
          });
        });
      });
    });
  });

  it('should work correctly with HTTPS agent', done => {
    const httpsApp = https.createServer({
      key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
      cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
    }, (req, res) => {
      res.end('ok');
    });

    httpsApp.listen(0, () => {
      const httpsPort = httpsApp.address().port;
      const agent = new HttpsAgent({
        keepAlive: true,
        testOnBorrow: true,
        freeSocketTimeout: 1000,
        rejectUnauthorized: false,
      });

      https.get({ agent, port: httpsPort, path: '/', rejectUnauthorized: false }, res => {
        const socket1 = res.socket;
        res.resume();
        res.on('end', () => {
          setImmediate(() => {
            assert(socket1[SOCKET_ENTER_FREE_POOL_TIME] > 0,
              'HTTPS socket should have timestamp');

            // Simulate freeze
            socket1[SOCKET_ENTER_FREE_POOL_TIME] = Date.now() - 5000;

            https.get({ agent, port: httpsPort, path: '/', rejectUnauthorized: false }, res2 => {
              assert.notStrictEqual(res2.socket, socket1,
                'should not reuse stale HTTPS socket');
              assert(socket1.destroyed, 'stale HTTPS socket should be destroyed');
              res2.resume();
              res2.on('end', () => {
                agent.destroy();
                httpsApp.close(done);
              });
            });
          });
        });
      });
    });
  });

  it('should not purge stale sockets when testOnBorrow is false (default)', done => {
    const agent = new Agent({
      keepAlive: true,
      freeSocketTimeout: 1000,
      // testOnBorrow not set — defaults to false
    });

    http.get({ agent, port, path: '/' }, res => {
      const socket1 = res.socket;
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          // Manually stamp as if testOnBorrow were enabled (simulating stale socket)
          socket1[SOCKET_ENTER_FREE_POOL_TIME] = Date.now() - 10000;

          // Without testOnBorrow, addRequest does not purge — socket is reused
          http.get({ agent, port, path: '/' }, res2 => {
            assert.strictEqual(res2.socket, socket1,
              'should reuse socket when testOnBorrow is disabled (no purge)');
            res2.resume();
            res2.on('end', () => {
              agent.destroy();
              done();
            });
          });
        });
      });
    });
  });
});
