'use strict';

const assert = require('assert');
const http = require('http');
const urlparse = require('url').parse;
const pedding = require('pedding');
const Agent = require('../');

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
      }, parseInt(info.query.timeout, 10));
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

  after(done => setTimeout(done, 1500));

  it('should default options set right', () => {
    const agent = agentkeepalive;
    assert(agent.keepAlive === true);
    assert(agent.keepAliveMsecs === 1000);
    assert(agent.maxSockets === 5);
    assert(agent.maxFreeSockets === 5);
    assert(agent.timeout === 30000);
    assert(!agent.socketActiveTTL);
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

  it('should inactivity socket timeout', done => {
    const name = 'localhost:' + port + ':';
    const agentkeepalive = new Agent({
      freeSocketKeepAliveTimeout: '5s',
      timeout: '1s',
    });
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

          // request /hang timeout
          http.get({
            agent: agentkeepalive,
            port,
            path: '/hang',
          }, () => {
            assert(false, 'should not run this');
          }).on('error', err => {
            // TODO: should be a better error message than "socket hang up"
            assert(err.message === 'socket hang up');
            assert(err.code === 'ECONNRESET');
            done();
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
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    assert(agentkeepalive.freeSockets[name].length === 1);

    // should emit agent close event too
    agentkeepalive.once('close', done);

    const req = http.get({
      agent: agentkeepalive,
      port,
      path: '/error',
    }, () => {
      throw new Error('should not call this');
    });
    req.on('error', err => {
      assert(err.message === 'socket hang up');
      assert(agentkeepalive.sockets[name].length === 1);
      assert(!agentkeepalive.freeSockets[name]);
      setTimeout(() => {
        assert(!agentkeepalive.sockets[name]);
        assert(!agentkeepalive.freeSockets[name]);
        done();
      }, 10);
    });
    assert(agentkeepalive.sockets[name].length === 1);
    assert(!agentkeepalive.freeSockets[name]);
  });

  it('should remove socket when socket.destroy()', done => {
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
    const name = 'localhost:' + port + ':';
    assert(!agentkeepalive.sockets[name]);
    const req = http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, () => {
      throw new Error('should not call this.');
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

  it('should fire timeout callback', done => {
    done = pedding(2, done);
    const lastStatus = agentkeepalive.getCurrentStatus();
    http.get({
      agent: agentkeepalive,
      port,
      path: '/',
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        const req = http.get({
          agent: agentkeepalive,
          port,
          path: '/hang',
        }, () => {
          throw new Error('should not call this');
        });
        req.setTimeout(400, () => {
          const status = agentkeepalive.getCurrentStatus();
          assert(status.timeoutSocketCount - lastStatus.timeoutSocketCount === 1);
          setTimeout(done, 300);
        });
        req.on('error', err => {
          assert(err.message === 'socket hang up');
          done();
        });
      });
    });
  });

  it('should free socket timeout and emit agent timeout event', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      keepAliveTimeout: 1000,
    });
    agent.on('timeout', done);

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
          // free socket timeout after 1s
          setTimeout(() => {
            assert(!agent.freeSockets[name]);
            done();
          }, 1100);
        });
      });
    });
  });

  it('should working socket timeout and emit agent timeout event', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      timeout: 1000,
    });
    agent.on('timeout', done);

    http.get({
      agent,
      port,
      path: '/hang',
    }, () => {
      throw new Error('should not run this');
    }).on('error', err => {
      assert(err.message === 'socket hang up');
      assert(err.code === 'ECONNRESET');
      assert(!agent.sockets[name]);
      done();
    });
    assert(agent.sockets[name].length === 1);
  });

  it('should destroy free socket before timeout', done => {
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      keepAliveTimeout: 1000,
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
          agent.freeSockets[name][0].destroy();
          setTimeout(() => {
            assert(!agent.freeSockets[name]);
            done();
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
      keepAliveTimeout: 1000,
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
          done();
        });
      });
    });
    assert(agent.requests[name].length === 1);
  });

  it('should destroy all sockets', done => {
    done = pedding(2, done);
    const name = 'localhost:' + port + ':';
    const agent = new Agent({
      keepAliveTimeout: 1000,
    });
    let lastPort = null;
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
      res.on('data', data => {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        assert(lastPort > 0);
      });
      res.on('end', () => {
        agent.destroy();
        done();
      });
    });
  });

  it('should keep max sockets: bugfix for orginal keepalive agent', _done => {
    const agentkeepalive = new Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    const done = pedding(2, err => {
      assert(!err);
      const pool = agentkeepalive.sockets[Object.keys(agentkeepalive.sockets)[0]];
      assert(!pool);
      // all sockets on free list now
      const freepool = agentkeepalive.freeSockets[Object.keys(agentkeepalive.freeSockets)[0]];
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
        const pool = agentkeepalive.sockets[Object.keys(agentkeepalive.sockets)[0]];
        assert(pool);
        setTimeout(done, 10);
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
        const pool = agentkeepalive.sockets[Object.keys(agentkeepalive.sockets)[0]];
        assert(pool);
        setTimeout(done, 10);
      });
    });
  });

  it('should timeout and remove free socket', done => {
    done = pedding(2, done);
    const _keepaliveAgent = new Agent({
      maxSockets: 1,
      maxFreeSockets: 1,
      keepAliveTimeout: 1000,
    });

    const options = {
      hostname: 'registry.npmjs.org',
      port: 80,
      path: '/',
      method: 'GET',
      agent: _keepaliveAgent,
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
        console.log('socket:%s timeout', sock._host);
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
    it('should expire active socket when it is out of ttl', done => {
      const name = 'localhost:' + port + ':';
      const agent = new Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 5,
        maxFreeSockets: 5,
        timeout: 30000,
        freeSocketKeepAliveTimeout: 5000,
        socketActiveTTL: 500,
      });
      http.get({
        agent,
        port,
        path: '/',
      }, res => {
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          const firstCreatedTime = agent.sockets[name].pop().createdTime;
          setTimeout(function() {
            http.get({
              agent,
              port,
              path: '/',
            }, res => {
              assert(res.statusCode === 200);
              res.resume();
              res.on('end', () => {
                const currentCreatedTime = agent.sockets[name].pop().createdTime;
                assert(firstCreatedTime < currentCreatedTime);
                done();
              });
            });
          }, 600);
        });
      });

    });

    it('should not expire active socket when it is in ttl', done => {
      const name = 'localhost:' + port + ':';
      const agent = new Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 5,
        maxFreeSockets: 5,
        timeout: 30000,
        freeSocketKeepAliveTimeout: 5000,
        socketActiveTTL: 1000,
      });
      http.get({
        agent,
        port,
        path: '/',
      }, res => {
        assert(res.statusCode === 200);
        res.resume();
        res.on('end', () => {
          const firstCreatedTime = agent.sockets[name].pop().createdTime;
          setTimeout(function() {
            http.get({
              agent,
              port,
              path: '/',
            }, res => {
              assert(res.statusCode === 200);
              res.resume();
              res.on('end', () => {
                const currentCreatedTime = agent.sockets[name].pop().createdTime;
                assert(firstCreatedTime === currentCreatedTime);
                done();
              });
            });
          }, 600);
        });
      });

    });
  });
});
