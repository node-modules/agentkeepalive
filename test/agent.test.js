/*!
 * agentkeepalive - test/agent.test.js
 *
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var http = require('http');
var urlparse = require('url').parse;
var should = require('should');
require('should-http');
var pedding = require('pedding');
var Agent = require('../');

describe('agent.test.js', function () {

  var agentkeepalive = new Agent({
    keepAliveTimeout: 1000,
    maxSockets: 5,
    maxFreeSockets: 5,
  });

  var port = null;
  var app = http.createServer(function (req, res) {
    if (req.url === '/error') {
      res.destroy();
      return;
    } else if (req.url === '/hang') {
      // Wait forever.
      return;
    } else if (req.url === '/remote_close') {
      setTimeout(function () {
        req.connection.end();
      }, 500);
    }
    var info = urlparse(req.url, true);
    if (info.query.timeout) {
      setTimeout(function () {
        res.end(info.query.timeout);
      }, parseInt(info.query.timeout, 10));
      return;
    }
    res.end(JSON.stringify({
      info: info,
      url: req.url,
      headers: req.headers,
      socket: req.socket._getpeername()
    }));
  });

  before(function (done) {
    app.listen(0, function () {
      port = app.address().port;
      done();
    });
  });

  after(function (done) {
    setTimeout(done, 1500);
  });

  it('should default options set right', function () {
    var agent = agentkeepalive;
    agent.should.have.property('keepAlive', true);
    agent.should.have.property('keepAliveMsecs', 1000);
    agent.should.have.property('maxSockets', 5);
    agent.should.have.property('maxFreeSockets', 5);
  });

  var remotePort = null;

  it('should request / 200 status', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.not.have.key(name);
    agentkeepalive.freeSockets.should.not.have.key(name);
    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/'
    }, function (res) {
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        // cache for next test
        remotePort = data.socket.port;
      });
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.freeSockets.should.not.have.key(name);
        setTimeout(function () {
          agentkeepalive.sockets.should.not.have.key(name);
          agentkeepalive.freeSockets.should.have.key(name);
          agentkeepalive.freeSockets[name].should.length(1);
          done();
        }, 20);
      });
    });
    var status = agentkeepalive.getCurrentStatus();
    status.createSocketCount.should.equal(1);
    status.timeoutSocketCount.should.equal(0);
    status.sockets.should.have.key(name);
    status.sockets[name].should.equal(1);
    status.freeSockets.should.not.have.key(name);
  });

  it('should request again and use the same socket', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.not.have.key(name);
    agentkeepalive.freeSockets.should.have.key(name);
    agentkeepalive.freeSockets[name].should.length(1);
    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/foo',
    }, function (res) {
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        data.socket.port.should.equal(remotePort);
      });
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.freeSockets.should.have.not.key(name);
        setTimeout(function () {
          var status = agentkeepalive.getCurrentStatus();
          status.createSocketCount.should.equal(1);
          status.closeSocketCount.should.equal(0);
          status.timeoutSocketCount.should.equal(0);
          status.requestCount.should.equal(2);
          status.sockets.should.not.have.key(name);
          status.freeSockets.should.have.key(name);
          status.freeSockets[name].should.equal(1);
          done();
        }, 10);
      });
    });
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.sockets[name].should.length(1);
    agentkeepalive.freeSockets.should.have.not.key(name);
  });

  it('should remove keepalive socket when server side destroy()', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.have.not.key(name);
    agentkeepalive.freeSockets.should.have.key(name);
    agentkeepalive.freeSockets[name].should.length(1);
    var req = http.get({
      agent: agentkeepalive,
      port: port,
      path: '/error',
    }, function (res) {
      throw new Error('should not call this');
    });
    req.on('error', function (err) {
      should.exist(err);
      err.message.should.equal('socket hang up');
      agentkeepalive.sockets.should.have.key(name);
      agentkeepalive.freeSockets.should.have.not.key(name);
      setTimeout(function () {
        agentkeepalive.sockets.should.not.have.key(name);
        agentkeepalive.freeSockets.should.have.not.key(name);
        done();
      }, 10);
    });
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.sockets[name].should.length(1);
    agentkeepalive.freeSockets.should.have.not.key(name);
  });

  it('should remove socket when socket.destroy()', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.have.not.key(name);
    agentkeepalive.freeSockets.should.have.not.key(name);
    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
    }, function (res) {
      res.should.status(200);
      res.resume();
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.sockets[name].should.length(1);
        agentkeepalive.freeSockets.should.have.not.key(name);
        setTimeout(function () {
          agentkeepalive.sockets.should.have.not.key(name);
          agentkeepalive.freeSockets.should.have.key(name);
          agentkeepalive.freeSockets[name].should.length(1);
          agentkeepalive.freeSockets[name][0].destroy();
          setTimeout(function () {
            agentkeepalive.sockets.should.not.have.key(name);
            agentkeepalive.freeSockets.should.not.have.key(name);
            done();
          }, 10);
        }, 10);
      });
    }).on('error', done);
  });

  it('should use new socket when hit the max keepalive time: 1000ms', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.have.not.key(name);
    agentkeepalive.freeSockets.should.have.not.key(name);
    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
    }, function (res) {
      res.should.status(200);
      var lastPort = null;
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.sockets[name].should.length(1);
        agentkeepalive.freeSockets.should.have.not.key(name);
        setTimeout(function () {
          agentkeepalive.sockets.should.have.not.key(name);
          agentkeepalive.freeSockets.should.have.not.key(name);
          http.get({
            agent: agentkeepalive,
            port: port,
            path: '/',
          }, function (res) {
            res.should.status(200);
            res.on('data', function (data) {
              data = JSON.parse(data);
              should.exist(data.socket.port);
              data.socket.port.should.not.equal(lastPort);
            });
            res.on('end', function () {
              done();
            });
          });
        }, 2000);
      });
    });
  });

  it('should disable keepalive when keepAlive=false', function (done) {
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      keepAlive: false
    });
    agent.keepAlive.should.equal(false);
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      res.should.status(200);
      res.on('data', function () {});
      res.on('end', function () {
        agent.sockets.should.have.key(name);
        agent.freeSockets.should.not.have.key(name);
        setTimeout(function () {
          agent.sockets.should.have.not.key(name);
          agent.freeSockets.should.not.have.key(name);
          done();
        }, 10);
      });
    });
    agent.sockets.should.have.key(name);
    agent.sockets[name].should.length(1);
    agent.freeSockets.should.not.have.key(name);
  });

  it('should not keepalive when client.abort()', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.have.not.key(name);
    var req = http.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
    }, function (res) {
      throw new Error('should not call this.');
    });
    req.on('error', function (err) {
      should.exist(err);
      err.message.should.equal('socket hang up');
      agentkeepalive.sockets.should.not.have.key(name);
      agentkeepalive.freeSockets.should.have.not.key(name);
      done();
    });
    process.nextTick(function () {
      req.abort();
    });
  });

  it('should keep 1 socket', function (done) {
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      maxSockets: 1,
      maxFreeSockets: 1,
    });
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets[name].should.length(1);
      agent.requests[name].should.length(1);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        // should be reuse
        process.nextTick(function () {
          agent.sockets.should.have.key(name);
          agent.sockets[name].should.length(1);
          agent.freeSockets.should.not.have.key(name);
        });
      });
    });

    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets[name].should.length(1);
      agent.requests.should.not.have.key(name);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        data.socket.port.should.equal(lastPort);
      });
      res.on('end', function () {
        setTimeout(function () {
          // should keepalive 1 socket
          agent.sockets.should.have.not.key(name);
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(1);
          done();
        }, 10);
      });
    });
    agent.requests[name].should.length(1);
  });

  it('should keep 1 free socket', function (done) {
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      maxSockets: 2,
      maxFreeSockets: 1,
    });
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets.should.have.key(name);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        // should be reuse
        setTimeout(function () {
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(1);
        }, 100);
      });
    });

    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets.should.have.key(name);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        data.socket.port.should.not.equal(lastPort);
      });
      res.on('end', function () {
        setTimeout(function () {
          // should keepalive 1 socket
          agent.sockets.should.have.not.key(name);
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(1);
          done();
        }, 100);
      });
    });
    agent.requests.should.not.have.key(name);
  });

  it('should keep 2 free socket', function (done) {
    done = pedding(2, done);
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets.should.have.key(name);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        // should be reuse
        process.nextTick(function () {
          agent.freeSockets.should.have.key(name);
          done();
        });
      });
    });

    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets.should.have.key(name);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        data.socket.port.should.not.equal(lastPort);
      });
      res.on('end', function () {
        setTimeout(function () {
          // should keepalive 1 socket
          agent.sockets.should.have.not.key(name);
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(2);
          done();
        }, 10);
      });
    });
    agent.requests.should.not.have.key(name);
  });

  it('should request /remote_close 200 status, after 500ms free socket close', function (done) {
    var name = 'localhost:' + port + '::';
    agentkeepalive.sockets.should.not.have.key(name);
    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/remote_close'
    }, function (res) {
      res.should.status(200);
      res.resume();
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.freeSockets.should.not.have.key(name);
        setTimeout(function () {
          agentkeepalive.sockets.should.not.have.key(name);
          agentkeepalive.freeSockets.should.not.have.key(name);
          done();
        }, 550);
      });
    });
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.sockets[name].should.length(1);
  });

  it('should fire timeout callback', function (done) {
    var req = http.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
    }, function (res) {
      var req = http.get({
        port: port,
        path: '/hang',
      }, function (res) {
        throw new Error('should not call this');
      });
      req.setTimeout(400, function() {
        var status = agentkeepalive.getCurrentStatus();
        status.timeoutSocketCount.should.equal(1);
        setTimeout(done, 300);
      });
    });
  });

  it('should free socket timeout', function (done) {
    done = pedding(2, done);
    var name = 'localhost:' + port + '::';
    var agent = Agent({
      keepAliveTimeout: 1000,
    });
    agent.on('timeout', done);
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets[name].should.length(1);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        process.nextTick(function () {
          agent.sockets.should.not.have.key(name);
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(1);
          setTimeout(function () {
            agent.freeSockets.should.not.have.key(name);
            done();
          }, 1100);
        });
      });
    });
    should.exist(agent);
    agent.sockets.should.have.key(name);
    agent.sockets[name].should.length(1);
  });

  it('should working socket timeout', function (done) {
    done = pedding(2, done);
    var name = 'localhost:' + port + '::';
    var agent = Agent({
      keepAliveTimeout: 1000,
    });
    agent.on('timeout', done);
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/hang',
    }, function (res) {
      throw new Error('should not run this');
    }).on('error', function (err) {
      should.exist(err);
      // socket.destroy();
      err.message.should.equal('socket hang up');
      err.code.should.equal('ECONNRESET');
      agent.sockets.should.not.have.key(name);
      done();
    });
    should.exist(agent);
    agent.sockets.should.have.key(name);
    agent.sockets[name].should.length(1);
  });

  it('should destroy free socket before timeout', function (done) {
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      keepAliveTimeout: 1000,
    });
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets[name].should.length(1);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        process.nextTick(function () {
          agent.sockets.should.not.have.key(name);
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(1);
          agent.freeSockets[name][0].destroy();
          setTimeout(function () {
            agent.freeSockets.should.not.have.key(name);
            done();
          }, 10);
        });
      });
    });
    agent.sockets[name].should.length(1);
  });

  it('should remove error socket and create new one handle pedding request', function (done) {
    done = pedding(2, done);
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      keepAliveTimeout: 1000,
      maxSockets: 1,
      maxFreeSockets: 1
    });
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/error',
    }, function (res) {
      throw new Error('never run this');
    }).on('error', function (err) {
      err.message.should.equal('socket hang up');
    }).on('close', function () {
      done();
    });

    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      agent.sockets[name].should.length(1);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        process.nextTick(function () {
          agent.sockets.should.not.have.key(name);
          agent.freeSockets.should.have.key(name);
          agent.freeSockets[name].should.length(1);
          done();
        });
      });
    });
    agent.requests.should.have.key(name);
    agent.requests[name].should.length(1);
  });

  it('should destroy all sockets', function (done) {
    done = pedding(2, done);
    var name = 'localhost:' + port + '::';
    var agent = new Agent({
      keepAliveTimeout: 1000,
    });
    var lastPort = null;
    http.get({
      agent: agent,
      port: port,
      path: '/',
    }, function (res) {
      http.get({
        agent: agent,
        port: port,
        path: '/',
      }).on('error', function (err) {
        err.message.should.equal('socket hang up');
        setTimeout(function () {
          agent.sockets.should.not.have.key(name);
          agent.freeSockets.should.not.have.key(name);
          done();
        }, 10);
      });

      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        agent.destroy();
        done();
      });
    });
  });

  it('should keep max sockets: bugfix for orginal keepalive agent', function (_done) {
    var agentkeepalive = new Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 2,
      maxFreeSockets: 2,
    });
    var done = pedding(2, function (err) {
      should.not.exist(err);
      var pool = agentkeepalive.sockets[Object.keys(agentkeepalive.sockets)[0]];
      should.not.exist(pool);
      // all sockets on free list now
      var freepool = agentkeepalive.freeSockets[Object.keys(agentkeepalive.freeSockets)[0]];
      should.exist(freepool);
      freepool.length.should.equal(2);
      _done();
    });

    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
    }, function (res) {
      res.statusCode.should.equal(200);
      res.on('data', function (data) {
      });
      res.on('end', function () {
        var pool = agentkeepalive.sockets[Object.keys(agentkeepalive.sockets)[0]];
        should.exist(pool);
        setTimeout(done, 10);
      });
    });

    http.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
    }, function (res) {
      res.statusCode.should.equal(200);
      res.on('data', function (data) {
      });
      res.on('end', function () {
        var pool = agentkeepalive.sockets[Object.keys(agentkeepalive.sockets)[0]];
        should.exist(pool);
        setTimeout(done, 10);
      });
    });
  });

  it('should timeout and remove free socket', function (done) {
    done = pedding(2, done);
    var _keepaliveAgent = new Agent({
      maxSockets: 1,
      maxFreeSockets: 1,
      keepAliveTimeout: 1000
    });

    var options = {
      hostname: 'www.taobao.com',
      port: 80,
      path: '/',
      method: 'GET',
      agent : _keepaliveAgent
    };

    var index = 0;
    var getRequest = function() {
      var currentIndex = index++;
      var req =  http.request(options, function(res) {
        var size = 0;
        res.on('data', function(chunk) {
          size += chunk.length;
        });
        res.on('end', function() {
          console.log('#%d req end, size: %d', currentIndex, size);
          done();
        });
      });
      req.on('error', done);
      return req;
    };

    var req = getRequest();
    // Get a reference to the socket.
    req.on('socket', function(sock) {
      // Listen to timeout and send another request immediately.
      sock.on('timeout', function() {
        console.log('socket:%s timeout', sock._host);
        getRequest().end();
      });
    });
    req.end();
  });

  describe('keepAlive = false', function () {
    it('should close socket after request', function (done) {
      var name = 'localhost:' + port + '::';
      var agent = new Agent({
        keepAlive: false,
      });
      http.get({
        agent: agent,
        port: port,
        path: '/',
      }, function (res) {
        res.should.status(200);
        res.resume();
        res.on('end', function () {
          setTimeout(function () {
            agent.sockets.should.not.have.key(name);
            agent.freeSockets.should.not.have.key(name);
            done();
          }, 10);
        });
      });
    });
  });
});
