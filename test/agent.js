/*!
 * agentkeepalive - test/agent.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Agent = require('../');
var http = require('http');
var urlparse = require('url').parse;
var should = require('should');
var pedding = require('pedding');

describe('agent.js', function () {

  var agentkeepalive = new Agent({
    maxKeepAliveTime: 1000
  });
  var port = null;
  var app = http.createServer(function (req, res) {
    if (req.url === '/error') {
      res.destroy();
      return;
    } else if (req.url === '/hang') {
      // Wait forever.
      return;
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

  it('should default options set right', function () {
    var agent = new Agent();
    agent.should.have.property('maxKeepAliveTime', 60000);
    agent.should.have.property('maxSockets', 5);
  });

  var remotePort = null;

  it('should request / 200 status', function (done) {
    var name = 'localhost:' + port;
    agentkeepalive.sockets.should.not.have.key(name);
    http.get({
      port: port,
      path: '/',
      agent: agentkeepalive
    }, function (res) {
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        // cache for next test
        remotePort = data.socket.port;
      });
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.unusedSockets.should.not.have.key(name);
        process.nextTick(function () {
          agentkeepalive.sockets.should.have.key(name);
          agentkeepalive.unusedSockets.should.have.key(name);
          agentkeepalive.unusedSockets[name].should.length(1);
          done();
        });
      });
    });
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.sockets[name].should.length(1);
    agentkeepalive.unusedSockets.should.not.have.key(name);
  });

  it('should request again and use the same socket', function (done) {
    var name = 'localhost:' + port;
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.unusedSockets.should.have.key(name);
    agentkeepalive.unusedSockets[name].should.length(1);
    http.get({
      port: port,
      path: '/foo',
      agent: agentkeepalive
    }, function (res) {
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        data.socket.port.should.equal(remotePort);
      });
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.unusedSockets.should.have.key(name);
        agentkeepalive.unusedSockets[name].should.length(0);
        process.nextTick(function () {
          agentkeepalive.sockets.should.have.key(name);
          agentkeepalive.unusedSockets.should.have.key(name);
          agentkeepalive.unusedSockets[name].should.length(1);
          done();
        });
      });
    });
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.sockets[name].should.length(1);
    agentkeepalive.unusedSockets.should.have.key(name);
    agentkeepalive.unusedSockets[name].should.length(0);
  });

  it('should remove keepalive socket when server side destroy()', function (done) {
    var name = 'localhost:' + port;
    agentkeepalive.sockets.should.have.key(name);
    var req = http.get({
      port: port,
      path: '/error',
      agent: agentkeepalive
    }, function (res) {
      throw new Error('should not call this');
    });
    req.on('error', function (err) {
      should.exist(err);
      err.message.should.equal('socket hang up');
      agentkeepalive.sockets.should.have.key(name);
      agentkeepalive.sockets[name].should.length(1);
      agentkeepalive.unusedSockets.should.have.key(name);
      agentkeepalive.unusedSockets[name].should.length(0);
      done();
    });
    agentkeepalive.sockets.should.have.key(name);
    agentkeepalive.sockets[name].should.length(1);
    agentkeepalive.unusedSockets.should.have.key(name);
  });

  it('should remove socket when socket.destroy()', function (done) {
    var name = 'localhost:' + port;
    http.get({
      port: port,
      path: '/',
      agent: agentkeepalive
    }, function (res) {
      res.should.status(200);
      res.on('end', function () {
        agentkeepalive.sockets.should.have.key(name);
        agentkeepalive.unusedSockets.should.have.key(name);
        agentkeepalive.unusedSockets[name].should.length(0);
        process.nextTick(function () {
          agentkeepalive.sockets.should.have.key(name);
          agentkeepalive.unusedSockets.should.have.key(name);
          agentkeepalive.unusedSockets[name].should.length(1);

          agentkeepalive.unusedSockets[name][0].destroy();
          process.nextTick(function () {
            agentkeepalive.sockets.should.not.have.key(name);
            agentkeepalive.unusedSockets.should.not.have.key(name);
            done();
          });
        });
      });
    });
  });

  it('should use new socket when hit the max keepalive time: 1000ms', function (done) {
    var name = 'localhost:' + port;
    http.get({
      port: port,
      path: '/',
      agent: agentkeepalive
    }, function (res) {
      res.should.status(200);
      var lastPort = null;
      res.on('data', function (data) {
        data = JSON.parse(data);
        lastPort = data.socket.port;
        should.exist(lastPort);
      });
      res.on('end', function () {
        setTimeout(function () {

          http.get({
            port: port,
            path: '/',
            agent: agentkeepalive
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

        }, 1100);

      });
    });
  });

  it('should disable keepalive when maxKeepAliveTime=0', function (done) {
    var name = 'localhost:' + port;
    var agent = new Agent({
      maxKeepAliveTime: 0
    });
    agent.maxKeepAliveTime.should.equal(0);
    http.get({
      port: port,
      path: '/',
      agent: agent
    }, function (res) {
      res.should.status(200);
      res.on('end', function () {
        agent.sockets.should.have.key(name);
        agent.unusedSockets.should.not.have.key(name);
        process.nextTick(function () {
          agent.sockets.should.have.key(name);
          agent.unusedSockets.should.not.have.key(name);
          done();
        });
      });
    });
    agent.sockets[name].should.length(1);
    agent.unusedSockets.should.not.have.key(name);
  });

  it('should not keepalive when client.abort()', function (done) {
    var name = 'localhost:' + port;
    var client = http.get({
      port: port,
      path: '/',
      agent: agentkeepalive
    }, function (res) {
      throw new Error('should not call this.');
    });
    client.on('error', function (err) {
      should.exist(err);
      err.message.should.equal('socket hang up');
      agentkeepalive.sockets.should.not.have.key(name);
      agentkeepalive.unusedSockets[name].should.length(0);
      done();
    });
    process.nextTick(function () {
      client.abort();
    });
  });

  it('should keep 1 socket', function (done) {
    var name = 'localhost:' + port;
    var agent = new Agent({
      maxSockets: 1,
    });
    var lastPort = null;
    http.get({
      port: port,
      path: '/',
      agent: agent,
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
        process.nextTick(function () {
          agent.unusedSockets.should.not.have.key(name);
        });
      });
    });

    http.get({
      port: port,
      path: '/',
      agent: agent,
    }, function (res) {
      agent.sockets[name].should.length(1);
      agent.requests.should.not.have.key(name);
      res.should.status(200);
      res.on('data', function (data) {
        data = JSON.parse(data);
        data.socket.port.should.equal(lastPort);
      });
      res.on('end', function () {
        process.nextTick(function () {
          agent.unusedSockets[name].should.length(1);
          done();
        });
      });
    });
    agent.requests[name].should.length(1);

  });

  it('should set maxKeepAliveRequests = 0 when options.maxKeepAliveRequests can not parseInt', function () {
    new Agent({
      maxSockets: 1,
      maxKeepAliveRequests: 'foo'
    }).should.have.property('maxKeepAliveRequests', 0);
    new Agent({
      maxSockets: 1,
      maxKeepAliveRequests: ''
    }).should.have.property('maxKeepAliveRequests', 0);
    new Agent({
      maxSockets: 1,
    }).should.have.property('maxKeepAliveRequests', 0);
    new Agent({
      maxSockets: 1,
      maxKeepAliveRequests: '0'
    }).should.have.property('maxKeepAliveRequests', 0);
    new Agent({
      maxSockets: 1,
      maxKeepAliveRequests: 0
    }).should.have.property('maxKeepAliveRequests', 0);
  });

  it('should maxKeepAliveRequests work with 1 and 10', function (done) {
    var name = 'localhost:' + port;
    function request(agent, checkCount, callback) {
      http.get({
        port: port,
        path: '/foo',
        agent: agent,
      }, function (res) {
        agent.sockets[name].should.length(1);
        res.should.status(200);
        res.on('end', function () {
          process.nextTick(function () {
            agent.createSocketCount.should.equal(checkCount);
            callback();
          });
        });
      });
    }

    done = pedding(2, done);
    var agent1 = new Agent({
      maxSockets: 1,
      maxKeepAliveRequests: 1
    });
    request(agent1, 1, function () {
      request(agent1, 2, done);
    });

    var agent10 = new Agent({
      maxSockets: 1,
      maxKeepAliveRequests: 10
    });
    var requestDone = pedding(agent10.maxKeepAliveRequests, function () {
      request(agent10, 2, done);
    });
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
    request(agent10, 1, requestDone);
  });

  it('should not fire timeout callback more than once', function (done) {
    var counter = 0;
    var req = http.get({
      port: port,
      path: '/',
      agent: agentkeepalive
    }, function (res) {
      var req = http.get({
        port: port,
        path: '/hang',
      }, function (res) {
        throw new Error('should not call this');
      });
      req.setTimeout(500, function() {
        done();
      });
    });
    req.setTimeout(500, function() {
      throw new Error('Timeout callback for previous request called.');
    });
  });

});
