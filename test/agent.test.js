'use strict';

const assert = require('assert');
const http = require('http');
const urlparse = require('url').parse;
const pedding = require('pedding');
const mm = require('mm');
const Agent = require('..');
const {
  CURRENT_ID,
  SOCKET_NAME,
  SOCKET_CREATED_TIME,
  SOCKET_REQUEST_COUNT,
  SOCKET_REQUEST_FINISHED_COUNT,
} = require('..').constants;

describe('test/agent.test.js', () => {
  const agentkeepalive = new Agent({
    keepAliveTimeout: 1000,
    maxSockets: 5,
    maxFreeSockets: 5,
  });

  let port = null;
  const app = http.createServer((req, res) => {
    if (req.url === '/error') {
      res.destroy();
      return;
    } else if (req.url === '/hang') {
      console.log('[new request] %s %s', req.method, req.url);
      // Wait forever.
      return;
    } else if (req.url === '/remote_close') {
      setTimeout(() => {
        req.connection.end();
      }, 500);
    }
    const info = urlparse(req.url, true);
    if (info.query.timeout) {
      setTimeout(() => {
        res.end(info.query.timeout);
      }, parseInt(info.query.timeout));
      return;
    }
    res.end(JSON.stringify({
      info,
      url: req.url,
      headers: req.headers,
      socket: req.socket._getpeername(),
    }));
  });

  before(done => {
    app.listen(0, () => {
      port = app.address().port;
      done();
    });
  });

  afterEach(mm.restore);

  after(done => setTimeout(() => {
    agentkeepalive.destroy();
    done();
  }, 1500));

  it('should default options set right', () => {
    const agent = agentkeepalive;
    assert(agent.keepAlive === true);
    assert(agent.keepAliveMsecs === 1000);
    assert(agent.maxSockets === 5);
    assert(agent.maxFreeSockets === 5);
    assert(agent.timeout === 30000);
    assert(agent.options.timeout === 30000);
    assert(agent.freeSocketKeepAliveTimeout === 1000);
    assert(agent.options.freeSocketTimeout === 1000);
    assert(!agent.socketActiveTTL);
    assert(agent.socketActiveTTL === 0);
    assert(agent.options.socketActiveTTL === 0);
  });

  let remotePort = null;

  it('should request with connection: keep-alive with http.Agent(keepAlive=true)', done => {
    const agent = new http.Agent({
      keepAlive: true,
    });
    const req = http.request({
      method: 'GET',
      port,
      path: '/',
      agent,
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        assert(data.headers.connection === 'keep-alive');
        done();
      });
    });
    req.end();
  });

  it('should request with connection: close with http.Agent()', done => {
    const req = http.request({
      method: 'GET',
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        assert(data.headers.connection === 'close');
        done();
      });
    });
    req.end();
  });

  it('should destroy inactivity socket timeout by agent itself', done => {
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      freeSocketKeepAliveTimeout: '5s',
      timeout: '1s',
    });
    assert(agentkeepalive.options.freeSocketTimeout === 5000);
    assert(agentkeepalive.options.timeout === 1000);
    assert(!agentkeepalive.sockets[name]);
    assert(!agentkeepalive.freeSockets[name]);
    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.resume();
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        console.log('end and got %d bytes', buf.length);
        const data = JSON.parse(buf);
        remotePort = data.socket.port;
        assert(data.headers.connection === 'keep-alive');
        assert(agentkeepalive.sockets[name]);
        assert(!agentkeepalive.freeSockets[name]);
        setTimeout(() => {
          assert(!agentkeepalive.sockets[name]);
          assert(agentkeepalive.freeSockets[name]);
          assert(agentkeepalive.freeSockets[name].length === 1);

          // request /hang timeout
          http.get({
            agent: agentkeepalive,
            port,
            path: '/hang',
          }, () => {
            assert(false, 'should not run this');
          }).on('error', err => {
            assert(err.message === 'Socket timeout');
            assert(err.code === 'ERR_SOCKET_TIMEOUT');
            done();
          });
        }, 20);
      });
    });
  });

  it('should let request handle the socket timeout', done => {
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      freeSocketKeepAliveTimeout: '5s',
      timeout: '1s',
    });
    assert(agentkeepalive.options.freeSocketTimeout === 5000);
    assert(agentkeepalive.options.timeout === 1000);
    assert(!agentkeepalive.sockets[name]);
    assert(!agentkeepalive.freeSockets[name]);
    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.resume();
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        console.log('end and got %d bytes', buf.length);
        const data = JSON.parse(buf);
        remotePort = data.socket.port;
        assert(data.headers.connection === 'keep-alive');
        assert(agentkeepalive.sockets[name]);
        assert(!agentkeepalive.freeSockets[name]);
        setTimeout(() => {
          assert(!agentkeepalive.sockets[name]);
          assert(agentkeepalive.freeSockets[name]);
          assert(agentkeepalive.freeSockets[name].length === 1);

          // request /hang timeout
          let handleTimeout = false;
          const req = http.get({
            agent: agentkeepalive,
            port,
            path: '/hang',
            timeout: 2000,
          }, () => {
            assert(false, 'should not run this');
          }).on('error', err => {
            assert(handleTimeout);
            // TODO: should be a better error message than "socket hang up"
            assert(err.message === 'socket hang up');
            assert(err.code === 'ECONNRESET');
            done();
          });
          req.on('timeout', () => {
            handleTimeout = true;
            req.abort();
          });
        }, 20);
      });
    });
  });

  it('should request / 200 status', done => {
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    assert(!agentkeepalive.freeSockets[name]);
    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        remotePort = data.socket.port;
        assert(data.headers.connection === 'keep-alive');
        assert(agentkeepalive.sockets[name]);
        assert(!agentkeepalive.freeSockets[name]);
        setTimeout(() => {
          assert(!agentkeepalive.sockets[name]);
          assert(agentkeepalive.freeSockets[name]);
          assert(agentkeepalive.freeSockets[name].length === 1);
          done();
        }, 20);
      });
    });

    const status = agentkeepalive.getCurrentStatus();
    assert(status.createSocketCount === 1);
    assert(status.timeoutSocketCount === 0);
    assert(status.sockets[name] === 1);
    assert(!status.freeSockets[name]);
  });

  it('should mock CURRENT_ID cross MAX_SAFE_INTEGER', _done => {
    const agent = new Agent({
      timeout: 1000,
      freeSocketTimeout: 1000,
      maxSockets: 10,
      maxFreeSockets: 5,
    });
    agent[CURRENT_ID] = Number.MAX_SAFE_INTEGER - 1;
    const done = pedding(300, () => {
      // only allow 10 sockets
      assert(agent[CURRENT_ID] === 9);
      setImmediate(() => {
        const name = 'localhost:' + port + ':';
        assert(agent.freeSockets[name].length === 5);
        agent.destroy();
        _done();
      });
    });
    function request(callback) {
      http.get({
        agent,
        port,
        path: '/',
      }, res => {
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', callback);
      });
    }
    for (let i = 0; i < 300; i++) {
      request(done);
    }
  });

  it('should work on timeout same as freeSocketTimeout', done => {
    const agent = new Agent({
      timeout: 1000,
      freeSocketTimeout: 1000,
    });

    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      const socket1 = res.socket;
      const timeout = socket1.timeout || socket1._idleTimeout;
      assert(timeout === 1000);
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          const timeout = socket1.timeout || socket1._idleTimeout;
          assert(timeout === 1000);
          http.get({
            agent,
            port,
            path: '/',
          }, res => {
            const socket2 = res.socket;
            assert(socket2 === socket1);
            const timeout = socket2.timeout || socket2._idleTimeout;
            assert(timeout === 1000);
            assert(res.statusCode === 200);
            res.resume();
            res.on('end', done);
          });
        });
      });
    });
  });

  it('should work on freeSocketTimeout = 0', done => {
    const agent = new Agent({
      timeout: 100,
      freeSocketTimeout: 0,
    });

    http.get({
      agent,
      port,
      path: '/?timeout=80',
    }, res => {
      const socket1 = res.socket;
      const timeout = socket1.timeout || socket1._idleTimeout;
      assert(timeout === 100);
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        setTimeout(() => {
          http.get({
            agent,
            port,
            path: '/',
          }, res => {
            const socket2 = res.socket;
            assert(socket2 === socket1);
            const timeout = socket2.timeout || socket2._idleTimeout;
            assert(timeout === 100);
            assert(res.statusCode === 200);
            res.resume();
            res.on('end', done);
          });
        }, 80);
      });
    });
  });

  it('should createConnection error', done => {
    const agent = new Agent();
    mm.error(require('http').Agent.prototype, 'createConnection', 'mock createConnection error');
    http.get({
      agent,
      port,
      path: '/',
    }).on('error', err => {
      assert(err);
      assert(err.message === 'mock createConnection error');
      done();
    });
  });

  it('should keepSocketAlive return false, no use any socket', done => {
    const agent = new Agent();
    mm(require('http').Agent.prototype, 'keepSocketAlive', () => {
      return false;
    });
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      const socket1 = res.socket;
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          http.get({
            agent,
            port,
            path: '/',
          }, res => {
            const socket2 = res.socket;
            assert(socket2 !== socket1);
            res.resume();
            res.on('end', done);
          });
        });
      });
    });
  });

  it('should agent emit socket error event', done => {
    const agent = new Agent({
      timeout: 100,
    });
    const req = http.get({
      agent,
      port,
      path: '/hang',
    });
    // remove mocha default handler
    const originalException = process.listeners('uncaughtException').pop();
    process.removeListener('uncaughtException', originalException);
    process.once('uncaughtException', err => {
      // ignore future req error
      req.on('error', () => {});
      process.on('uncaughtException', originalException);
      assert(err);
      assert(err.message === 'Socket timeout');
      done();
    });
  });

  it('should mock socket error', done => {
    done = pedding(2, done);
    const agent = new Agent({
      timeout: 100,
    });
    const req = http.get({
      agent,
      port,
      path: '/hang',
    });
    req.on('socket', socket => {
      // remove req error listener
      const listener = socket.listeners('error').pop();
      socket.removeListener('error', listener);
      // must destroy before emit error
      socket.destroy();
      socket.emit('error', new Error('mock socket error'));
    }).on('error', err => {
      assert(err);
      assert(err.message === 'socket hang up');
      done();
    });
    // remove mocha default handler
    const originalException = process.listeners('uncaughtException').pop();
    process.removeListener('uncaughtException', originalException);
    assert(process.listeners('uncaughtException').length === 0);
    process.once('uncaughtException', err => {
      process.on('uncaughtException', originalException);
      assert(err);
      assert(err.message === 'mock socket error');
      done();
    });
  });

  it('should request again and use the same socket', done => {
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    assert(agentkeepalive.freeSockets[name]);
    assert(agentkeepalive.freeSockets[name].length === 1);

    http.get({
      agent: agentkeepalive,
      port,
      path: '/foo',
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        assert(data.socket.port === remotePort);

        assert(agentkeepalive.sockets[name]);
        assert(!agentkeepalive.freeSockets[name]);
        setTimeout(() => {
          const status = agentkeepalive.getCurrentStatus();
          assert(status.createSocketCount === 1);
          assert(status.closeSocketCount === 0);
          assert(status.timeoutSocketCount === 0);
          assert(status.requestCount === 2);
          assert(!status.sockets[name]);
          assert(status.freeSockets[name]);
          assert(status.freeSockets[name] === 1);
          done();
        }, 10);
      });
    });
    assert(agentkeepalive.sockets[name]);
    assert(agentkeepalive.sockets[name].length === 1);
    assert(!agentkeepalive.freeSockets[name]);
  });

  it('should remove keepalive socket when server side destroy()', done => {
    const agent = new Agent({
      keepAliveTimeout: 1000,
      maxSockets: 5,
      maxFreeSockets: 5,
    });

    http.get({
      agent,
      port,
      path: '/foo',
    }, res => {
      assert(res.statusCode === 200);
      const chunks = [];
      res.on('data', data => {
        chunks.push(data);
      });
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        assert(data.socket.port);
        setTimeout(next, 1);
      });
    });

    function next() {
      const name = 'localhost:' + port + ':';
      assert(!agent.sockets[name]);
      assert(agent.freeSockets[name] && agent.freeSockets[name].length === 1);

      const req = http.get({
        agent,
        port,
        path: '/error',
      }, () => {
        assert.fail('should not call this');
      });
      req.on('error', err => {
        assert(err.message === 'socket hang up');
        assert(agent.sockets[name].length === 1);
        assert(!agent.freeSockets[name]);
        setTimeout(() => {
          assert(!agent.sockets[name]);
          assert(!agent.freeSockets[name]);
          done();
        }, 10);
      });
      assert(agent.sockets[name].length === 1);
      assert(!agent.freeSockets[name]);
    }
  });

  it('should remove socket when socket.destroy()', done => {
    const agentkeepalive = new Agent({
      freeSocketTimeout: 1000,
      maxSockets: 5,
      maxFreeSockets: 5,
    });
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    assert(!agentkeepalive.freeSockets[name]);
    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name].length === 1);
        assert(!agentkeepalive.freeSockets[name]);
        setTimeout(() => {
          assert(!agentkeepalive.sockets[name]);
          assert(agentkeepalive.freeSockets[name].length === 1);
          agentkeepalive.freeSockets[name][0].destroy();
          setTimeout(() => {
            assert(!agentkeepalive.sockets[name]);
            assert(!agentkeepalive.freeSockets[name]);
            done();
          }, 10);
        }, 10);
      });
    }).on('error', done);
  });

  it('should use new socket when hit the max keepalive time: 1000ms', done => {
    const agentkeepalive = new Agent({
      freeSocketTimeout: 1000,
      maxSockets: 5,
      maxFreeSockets: 5,
    });
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    assert(!agentkeepalive.freeSockets[name]);
    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      let lastPort = null;
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        assert(agentkeepalive.sockets[name].length === 1);
        assert(!agentkeepalive.freeSockets[name]);

        // free keepAlive socket timeout and destroy
        setTimeout(() => {
          assert(!agentkeepalive.sockets[name]);
          assert(!agentkeepalive.freeSockets[name]);
          http.get({
            agent: agentkeepalive,
            port,
            path: '/',
          }, res => {
            assert(res.statusCode === 200);
            res.on('data', data => {
              data = JSON.parse(data);
              assert(data.socket.port > 0);
              assert(data.socket.port !== lastPort);
            });
            res.on('end', done);
          });
        }, 2000);
      });
    });
  });

  it('should disable keepalive when keepAlive=false', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      keepAlive: false,
    });
    assert(agent.keepAlive === false);

    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.on('data', data => {
        assert(JSON.parse(data).headers.connection === 'close');
      });
      res.on('end', () => {
        assert(agent.sockets[name].length === 1);
        assert(!agent.freeSockets[name]);
        setTimeout(() => {
          assert(!agent.sockets[name]);
          assert(!agent.freeSockets[name]);
          done();
        }, 10);
      });
    });
  });

  it('should not keepalive when client.abort()', done => {
    const agentkeepalive = new Agent({
      freeSocketTimeout: 1000,
      maxSockets: 5,
      maxFreeSockets: 5,
    });
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    const req = http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, () => {
      assert.fail('should not call this.');
    });
    req.on('error', err => {
      assert(err.message, 'socket hang up');
      assert(!agentkeepalive.sockets[name]);
      assert(!agentkeepalive.freeSockets[name]);
      done();
    });
    process.nextTick(() => {
      req.abort();
    });
    assert(agentkeepalive.sockets[name].length === 1);
  });

  it('should keep 1 socket', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      maxSockets: 1,
      maxFreeSockets: 1,
    });
    let lastPort = null;
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length === 1);
      assert(agent.requests[name].length === 1);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        // should be reuse
        process.nextTick(() => {
          assert(agent.sockets[name].length === 1);
          assert(!agent.freeSockets[name]);
        });
      });
    });

    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length === 1);
      assert(!agent.requests[name]);
      assert(res.statusCode === 200);

      res.on('data', data => {
        data = JSON.parse(data);
        assert(data.socket.port === lastPort);
      });
      res.on('end', () => {
        setTimeout(() => {
          // should keepalive 1 socket
          assert(!agent.sockets[name]);
          assert(agent.freeSockets[name].length === 1);
          done();
        }, 10);
      });
    });

    // has 1 request pedding in the requests queue
    assert(agent.requests[name].length === 1);
  });

  it('should keep 1 free socket', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      maxSockets: 2,
      maxFreeSockets: 1,
    });
    let lastPort = null;
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name]);
      assert(res.statusCode === 200);

      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        // should be reuse
        setTimeout(() => {
          assert(agent.freeSockets[name].length === 1);
        }, 100);
      });
    });

    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name]);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        assert(data.socket.port !== lastPort);
      });
      res.on('end', () => {
        setTimeout(() => {
          // should keepalive 1 socket
          assert(!agent.sockets[name]);
          assert(agent.freeSockets[name].length === 1);
          done();
        }, 100);
      });
    });
    assert(!agent.requests[name]);
  });

  it('should keep 2 free socket', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    let lastPort = null;
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        // should be reuse
        process.nextTick(() => {
          assert(agent.freeSockets[name]);
          done();
        });
      });
    });

    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        assert(data.socket.port !== lastPort);
      });
      res.on('end', () => {
        setTimeout(() => {
          // should keepalive 2 free sockets
          assert(!agent.sockets[name]);
          assert(agent.freeSockets[name].length === 2);
          done();
        }, 10);
      });
    });
    assert(!agent.requests[name]);
  });

  it('should request /remote_close 200 status, after 500ms free socket close', done => {
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);

    http.get({
      agent: agentkeepalive,
      port,
      path: '/remote_close',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name]);
        assert(!agentkeepalive.freeSockets[name]);
        setTimeout(() => {
          assert(!agentkeepalive.sockets[name]);
          assert(!agentkeepalive.freeSockets[name]);
          done();
        }, 550);
      });
    });
  });

  it('should fire req timeout callback the first use socket', done => {
    done = pedding(2, done);
    const agent = new Agent({
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        const lastStatus = agent.getCurrentStatus();
        const req = http.get({
          agent,
          port,
          path: '/hang',
        }, () => {
          assert.fail('should not call this');
        });
        req.setTimeout(100, () => {
          const status = agent.getCurrentStatus();
          assert(status.timeoutSocketCount - lastStatus.timeoutSocketCount === 1);
          req.abort();
          done();
        });
        req.on('error', err => {
          assert(err.message === 'socket hang up');
          done();
        });
      });
    });
  });

  it('should fire req timeout callback the second use socket', done => {
    done = pedding(2, done);
    const agent = new Agent({
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        const lastStatus = agent.getCurrentStatus();
        assert(lastStatus.createSocketCount === 1);
        // make sure reuse the same socket
        setImmediate(() => {
          const req = http.get({
            agent,
            port,
            path: '/hang',
          }, () => {
            assert.fail('should not call this');
          });
          req.setTimeout(100, () => {
            const status = agent.getCurrentStatus();
            assert(status.createSocketCount === 1);
            assert(status.timeoutSocketCount - lastStatus.timeoutSocketCount === 1);
            req.abort();
            done();
          });
          req.on('error', err => {
            assert(err.message === 'socket hang up');
            done();
          });
        });
      });
    });
  });

  it('should free socket timeout work', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      keepAliveTimeout: 100,
    });

    let lastPort = null;
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length === 1);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        process.nextTick(() => {
          assert(!agent.sockets[name]);
          assert(agent.freeSockets[name].length === 1);
          // free socket timeout after 100ms
          setTimeout(() => {
            assert(!agent.freeSockets[name]);
            done();
          }, 110);
        });
      });
    });
  });

  it('should first use working socket timeout', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      timeout: 100,
    });
    http.get({
      agent,
      port,
      path: '/hang',
    }, () => {
      throw new Error('should not run this');
    }).on('error', err => {
      assert(err.message === 'Socket timeout');
      assert(err.code === 'ERR_SOCKET_TIMEOUT');
      assert(!agent.sockets[name]);
      done();
    });
    assert(agent.sockets[name].length === 1);
  });

  it('should reuse working socket timeout', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      timeout: 100,
    });
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        setImmediate(() => {
          http.get({
            agent,
            port,
            path: '/hang',
          }, () => {
            throw new Error('should not run this');
          }).on('error', err => {
            assert(err.message === 'Socket timeout');
            assert(err.code === 'ERR_SOCKET_TIMEOUT');
            assert(!agent.sockets[name]);
            done();
          });
        });
      });
    });
    assert(agent.sockets[name].length === 1);
  });

  it('should destroy free socket before timeout', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent();
    let lastPort = null;
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length === 1);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        process.nextTick(() => {
          assert(!agent.sockets[name]);
          assert(agent.freeSockets[name].length === 1);
          agent.freeSockets[name][0].destroy();
          assert(agent.createSocketCount === 1);
          setTimeout(() => {
            assert(!agent.freeSockets[name]);
            // new request use the new socket
            http.get({
              agent,
              port,
              path: '/',
            }, res => {
              assert(agent.sockets[name].length === 1);
              assert(res.statusCode === 200);
              assert(agent.createSocketCount === 2);
              res.resume();
              res.on('end', done);
            });
          }, 10);
        });
      });
    });
    assert(agent.sockets[name].length === 1);
  });

  it('should remove error socket and create new one handle pedding request', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      maxSockets: 1,
      maxFreeSockets: 1,
    });
    let lastPort = null;
    http.get({
      agent,
      port,
      path: '/error',
    }, () => {
      throw new Error('never run this');
    }).on('error', err => {
      assert(err.message === 'socket hang up');
    }).on('close', () => done());

    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      assert(agent.sockets[name].length === 1);
      const socket = agent.sockets[name][0];
      assert(socket[SOCKET_REQUEST_COUNT] === 1);
      // not finish
      assert(socket[SOCKET_REQUEST_FINISHED_COUNT] === 0);
      assert(res.statusCode === 200);
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        process.nextTick(() => {
          assert(!agent.sockets[name]);
          assert(agent.freeSockets[name].length === 1);
          const socket = agent.freeSockets[name][0];
          assert(socket[SOCKET_REQUEST_COUNT] === 1);
          // request finished
          assert(socket[SOCKET_REQUEST_FINISHED_COUNT] === 1);
          done();
        });
      });
    });
    assert(agent.requests[name].length === 1);
  });

  it('should destroy all sockets when freeSockets is empty', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent();
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      http.get({
        agent,
        port,
        path: '/',
      }).on('error', err => {
        assert(err.message === 'socket hang up');
        setTimeout(() => {
          assert(!agent.sockets[name]);
          assert(!agent.freeSockets[name]);
          done();
        }, 10);
      });

      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agent.sockets[name].length === 2);
        agent.destroy();
        done();
      });
    });
  });

  it('should destroy both sockets and freeSockets', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent();
    http.get({
      agent,
      port,
      path: '/',
    }, res => {
      http.get({
        agent,
        port,
        path: '/',
      }).on('error', err => {
        assert(err.message === 'socket hang up');
        setTimeout(() => {
          assert(!agent.sockets[name]);
          assert(!agent.freeSockets[name]);
          done();
        }, 10);
      });

      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agent.sockets[name].length === 2);
        assert(!agent.freeSockets[name]);
        setImmediate(() => {
          assert(agent.sockets[name].length === 1);
          assert(agent.freeSockets[name].length === 1);
          agent.destroy();
          done();
        });
      });
    });
  });

  it('should keep max sockets: bugfix for orginal keepalive agent', _done => {
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    const done = pedding(2, err => {
      assert(!err);
      const pool = agentkeepalive.sockets[name];
      assert(!pool);
      // all sockets on free list now
      const freepool = agentkeepalive.freeSockets[name];
      assert(freepool.length === 2);
      _done();
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name]);
        setImmediate(done);
      });
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name]);
        setImmediate(done);
      });
    });
  });

  it('should make sure max sockets limit work', _done => {
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    const done = pedding(3, err => {
      assert(!err);
      const pool = agentkeepalive.sockets[name];
      assert(!pool);
      // all sockets on free list now
      const freepool = agentkeepalive.freeSockets[name];
      assert(freepool.length === 2);
      // make sure all free sockets SOCKET_REQUEST_FINISHED_COUNT equal to SOCKET_REQUEST_COUNT
      for (const s of freepool) {
        assert(s[SOCKET_REQUEST_FINISHED_COUNT] === s[SOCKET_REQUEST_COUNT]);
      }
      _done();
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name]);
        setImmediate(done);
      });
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name]);
        setImmediate(done);
      });
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        assert(agentkeepalive.sockets[name]);
        setImmediate(() => {
          // reuse free socket on addRequest
          assert(agentkeepalive.freeSockets[name]);
          http.get({
            agent: agentkeepalive,
            port,
            path: '/',
          }, res => {
            assert(res.statusCode === 200);
            res.resume();
            res.on('end', () => {
              assert(agentkeepalive.sockets[name]);
              setImmediate(done);
            });
          });
        });
      });
    });
    assert(agentkeepalive.sockets[name].length === 2);
    assert(!agentkeepalive.freeSockets[name]);
  });

  it('should timeout and remove free socket', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      maxSockets: 1,
      maxFreeSockets: 1,
      freeSocketTimeout: 1000,
    });

    const options = {
      hostname: 'registry.npmjs.org',
      port: 80,
      path: '/',
      method: 'GET',
      agent,
    };

    let index = 0;
    const getRequest = () => {
      const currentIndex = index++;
      const req = http.request(options, res => {
        let size = 0;
        res.on('data', chunk => {
          size += chunk.length;
        });
        res.on('end', () => {
          console.log('#%d req end, size: %d', currentIndex, size);
          done();
        });
      });
      req.on('error', done);
      return req;
    };

    const req = getRequest();
    // Get a reference to the socket.
    req.on('socket', sock => {
      // Listen to timeout and send another request immediately.
      sock.on('timeout', () => {
        console.log('free socket:%s timeout', sock._host);
        assert(!sock.writable);
        // sock has been removed from freeSockets list
        assert(!agent.freeSockets[name]);
        console.log('new request send');
        getRequest().end();
      });
    });
    req.end();
  });

  it('should not open more sockets than maxSockets when request success', done => {
    done = pedding(3, done);
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      keepAlive: true,
      keepAliveTimeout: 1000,
      maxSockets: 1,
      maxFreeSockets: 1,
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/hello1',
    }, res => {
      let info;
      assert(res.statusCode === 200);
      res.on('data', data => {
        info = JSON.parse(data);
      });
      res.on('end', () => {
        assert(info.url === '/hello1');
        assert(agentkeepalive.sockets[name].length === 1);
        done();
      });
      res.resume();
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/hello2',
    }, res => {
      let info;
      assert(res.statusCode === 200);
      res.on('data', data => {
        info = JSON.parse(data);
      });
      res.on('end', () => {
        assert(info.url === '/hello2');
        assert(agentkeepalive.sockets[name].length === 1);
        done();
      });
      res.resume();
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/hello3',
    }, res => {
      let info;
      assert(res.statusCode === 200);
      res.on('data', data => {
        info = JSON.parse(data);
      });
      res.on('end', () => {
        assert(info.url === '/hello3');
        assert(agentkeepalive.sockets[name].length === 1);
        done();
      });
      res.resume();
    });

    assert(Object.keys(agentkeepalive.sockets).length === 1);
    assert(agentkeepalive.sockets[name].length === 1);
  });

  it('should not open more sockets than maxSockets when request timeout', done => {
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      keepAlive: true,
      timeout: 1000,
      maxSockets: 1,
      maxFreeSockets: 1,
    });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/hang',
    }, () => {
      throw new Error('should not run this');
    })
      .on('error', () => {
        assert(agentkeepalive.sockets[name].length === 1);
        done();
      });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/hang',
    }, () => {
      throw new Error('should not run this');
    })
      .on('error', () => {
      // do noting
      });

    http.get({
      agent: agentkeepalive,
      port,
      path: '/hang',
    }, () => {
      throw new Error('should not run this');
    })
      .on('error', () => {
        // do noting
      });

    assert(Object.keys(agentkeepalive.sockets).length === 1);
  });

  it('should set req.reusedSocket to true when reuse socket', done => {
    const agent = new Agent({
      keepAlive: true,
    });

    // First request
    const req1 = http.get({
      port,
      path: '/',
      agent,
    }, res => {
      assert(res.statusCode === 200);
      res.on('data', () => {});
      res.on('end', () => {
        setTimeout(() => {
          // Second request
          const req2 = http.get({
            port,
            path: '/',
            agent,
          }, res => {
            assert(res.statusCode === 200);
            res.on('data', () => {});
            res.on('end', () => {
              done();
            });
          });
          // Second request reuses the socket
          assert(req2.reusedSocket);
        }, 10);
      });
    });

    // First request doesn't reuse the socket
    assert(!req1.reusedSocket);
  });

  describe('request timeout > agent timeout', () => {
    it('should use request timeout', done => {
      const agent = new Agent({
        keepAlive: true,
        timeout: 1000,
      });
      const req = http.get({
        agent,
        port,
        path: '/?timeout=20000',
        timeout: 1500,
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

  describe('keepAlive = false', () => {
    it('should close socket after request', done => {
      const name = 'localhost:' + port + ':';
      const agent = new Agent({
        keepAlive: false,
      });
      http.get({
        agent,
        port,
        path: '/',
      }, res => {
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          setTimeout(() => {
            assert(!agent.sockets[name]);
            assert(!agent.freeSockets[name]);
            done();
          }, 10);
        });
      });
    });
  });

  describe('getCurrentStatus()', () => {
    it('should get current agent status', () => {
      const status = agentkeepalive.getCurrentStatus();
      assert.deepEqual(Object.keys(status), [
        'createSocketCount', 'createSocketErrorCount', 'closeSocketCount',
        'errorSocketCount', 'timeoutSocketCount',
        'requestCount', 'freeSockets', 'sockets', 'requests',
      ]);
    });
  });

  describe('getter statusChanged', () => {
    it('should get statusChanged', () => {
      const agentkeepalive = new Agent({
        keepAliveTimeout: 1000,
        maxSockets: 5,
        maxFreeSockets: 5,
      });
      assert(agentkeepalive.statusChanged === false);
      assert(agentkeepalive.statusChanged === false);
      agentkeepalive.createSocketCount++;
      assert(agentkeepalive.createSocketCount !== agentkeepalive.createSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === true);
      assert(agentkeepalive.createSocketCount === agentkeepalive.createSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === false);

      agentkeepalive.createSocketErrorCount++;
      assert(agentkeepalive.createSocketErrorCount !== agentkeepalive.createSocketErrorCountLastCheck);
      assert(agentkeepalive.statusChanged === true);
      assert(agentkeepalive.createSocketErrorCount === agentkeepalive.createSocketErrorCountLastCheck);
      assert(agentkeepalive.statusChanged === false);

      agentkeepalive.closeSocketCount++;
      assert(agentkeepalive.closeSocketCount !== agentkeepalive.closeSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === true);
      assert(agentkeepalive.closeSocketCount === agentkeepalive.closeSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === false);

      agentkeepalive.errorSocketCount++;
      assert(agentkeepalive.errorSocketCount !== agentkeepalive.errorSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === true);
      assert(agentkeepalive.errorSocketCount === agentkeepalive.errorSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === false);

      agentkeepalive.timeoutSocketCount++;
      assert(agentkeepalive.timeoutSocketCount !== agentkeepalive.timeoutSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === true);
      assert(agentkeepalive.timeoutSocketCount === agentkeepalive.timeoutSocketCountLastCheck);
      assert(agentkeepalive.statusChanged === false);

      agentkeepalive.requestCount++;
      assert(agentkeepalive.requestCount !== agentkeepalive.requestCountLastCheck);
      assert(agentkeepalive.statusChanged === true);
      assert(agentkeepalive.requestCount === agentkeepalive.requestCountLastCheck);
      assert(agentkeepalive.statusChanged === false);
    });
  });

  describe('mock idle socket error', () => {
    it('should idle socket emit error event', done => {
      const agent = new Agent();

      const options = {
        host: 'registry.npmjs.org',
        port: 80,
        path: '/',
        agent,
      };

      const socketKey = agent.getName(options);
      const req = http.get(options, res => {
        let size = 0;
        assert(res.headers.connection === 'keep-alive');
        res.on('data', chunk => {
          size += chunk.length;
        });
        res.on('end', () => {
          assert(size > 0);
          assert(Object.keys(agent.sockets).length === 1);
          assert(Object.keys(agent.freeSockets).length === 0);
          process.nextTick(() => {
            assert(agent.freeSockets[socketKey].length === 1);
            setTimeout(() => {
              // agent should catch idle socket error event
              agent.freeSockets[socketKey][0].emit('error', new Error('mock read ECONNRESET'));

              setTimeout(() => {
                // error socket should be destroy and remove
                assert(Object.keys(agent.freeSockets).length === 0);
                done();
              }, 10);
            }, 10);
          });
        });
        res.resume();
      });
      req.on('error', done);
    });
  });

  describe('options.socketActiveTTL', () => {
    it('should expire on free socket timeout when it is out of ttl', done => {
      const agent = new Agent({
        keepAlive: true,
        maxSockets: 5,
        maxFreeSockets: 5,
        timeout: 30000,
        freeSocketKeepAliveTimeout: 5000,
        socketActiveTTL: 100,
      });
      const req1 = http.get({
        agent,
        port,
        path: '/',
      }, res => {
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          const socket1 = req1.socket;
          const firstCreatedTime = socket1[SOCKET_CREATED_TIME];
          assert(firstCreatedTime && typeof firstCreatedTime === 'number');
          setTimeout(() => {
            const req2 = http.get({
              agent,
              port,
              path: '/',
            }, res => {
              assert(res.statusCode === 200);
              res.resume();
              res.on('end', () => {
                assert(req2.socket !== socket1);
                const currentCreatedTime = req2.socket[SOCKET_CREATED_TIME];
                assert(currentCreatedTime && typeof currentCreatedTime === 'number');
                assert(firstCreatedTime < currentCreatedTime);
                done();
              });
            });
          }, 200);
        });
      });
    });

    it('should expire on socket reuse detect when it is out of ttl', done => {
      const agent = new Agent({
        keepAlive: true,
        socketActiveTTL: 10,
      });
      const req1 = http.get({
        agent,
        port,
        path: '/?timeout=20',
      }, res => {
        const socket1 = req1.socket;
        const firstCreatedTime = socket1[SOCKET_CREATED_TIME];
        assert(firstCreatedTime && typeof firstCreatedTime === 'number');
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          setImmediate(() => {
            const req2 = http.get({
              agent,
              port,
              path: '/',
            }, res => {
              // not the same socket
              assert(req2.socket[SOCKET_NAME] !== socket1[SOCKET_NAME]);
              const currentCreatedTime = req2.socket[SOCKET_CREATED_TIME];
              assert(currentCreatedTime && typeof currentCreatedTime === 'number');
              assert(firstCreatedTime < currentCreatedTime);
              assert(res.statusCode === 200);
              res.resume();
              res.on('end', done);
            });
          });
        });
      });
    });

    it('should not expire active socket when it is in ttl', done => {
      const agent = new Agent({
        socketActiveTTL: 1000,
      });
      const req1 = http.get({
        agent,
        port,
        path: '/',
      }, res => {
        const socket1 = req1.socket;
        const firstCreatedTime = socket1[SOCKET_CREATED_TIME];
        assert(firstCreatedTime && typeof firstCreatedTime === 'number');
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          setTimeout(function() {
            const timeout = socket1.timeout || socket1._idleTimeout;
            assert(timeout <= 1000);
            const req2 = http.get({
              agent,
              port,
              path: '/',
            }, res => {
              assert(res.statusCode === 200);
              res.resume();
              res.on('end', () => {
                assert(req2.socket[SOCKET_NAME] === socket1[SOCKET_NAME]);
                const currentCreatedTime = req2.socket[SOCKET_CREATED_TIME];
                assert(currentCreatedTime && typeof currentCreatedTime === 'number');
                assert(firstCreatedTime === currentCreatedTime);
                done();
              });
            });
          }, 100);
        });
      });
    });

    it('should TTL diff > freeSocketTimeout', done => {
      const agent = new Agent({
        freeSocketTimeout: 500,
        socketActiveTTL: 1000,
      });
      const req1 = http.get({
        agent,
        port,
        path: '/',
      }, res => {
        const socket1 = req1.socket;
        const firstCreatedTime = socket1[SOCKET_CREATED_TIME];
        assert(firstCreatedTime && typeof firstCreatedTime === 'number');
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          setTimeout(function() {
            const timeout = socket1.timeout || socket1._idleTimeout;
            assert(timeout === 500);
            const req2 = http.get({
              agent,
              port,
              path: '/',
            }, res => {
              assert(res.statusCode === 200);
              res.resume();
              res.on('end', () => {
                assert(req2.socket[SOCKET_NAME] === socket1[SOCKET_NAME]);
                const currentCreatedTime = req2.socket[SOCKET_CREATED_TIME];
                assert(currentCreatedTime && typeof currentCreatedTime === 'number');
                assert(firstCreatedTime === currentCreatedTime);
                done();
              });
            });
          }, 100);
        });
      });
    });
  });
});
