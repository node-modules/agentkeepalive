/*!
 * agentkeepalive - test/https_agent.test.js
 *
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var HttpsAgent = require('../').HttpsAgent;
var https = require('https');
var urlparse = require('url').parse;
var should = require('should');
var pedding = require('pedding');
var fs = require('fs');

describe('https_agent.test.js', function () {

  var app = null;
  var port = null;
  var agentkeepalive = new HttpsAgent({
    keepAliveTimeout: 1000,
    maxSockets: 5,
    maxFreeSockets: 5,
  });
  var nodeTlsRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  var node10 = process.version.indexOf('v0.10.') === 0;

  before(function (done) {
    if (node10) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    }
    app = https.createServer({
      key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
      cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
    }, function (req, res) {
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
        remotePort: req.socket.remotePort
      }));
    });
    app.listen(0, function () {
      port = app.address().port;
      done();
    });
  });

  after(function (done) {
    if (node10) {
      // recover original setting
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = nodeTlsRejectUnauthorized;
    }
    setTimeout(done, 1500);
  });

  it('should GET / success with 200 status', function (done) {
    https.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
      rejectUnauthorized: false,
    }, function (res) {
      res.should.status(200);
      res.resume();
      res.on('end', function () {
        process.nextTick(function () {
          Object.keys(agentkeepalive.sockets).should.length(0);
          Object.keys(agentkeepalive.freeSockets).should.length(1);
          done();
        });
      });
    });
    Object.keys(agentkeepalive.sockets).should.length(1);
  });

  it('should free socket timeout', function (done) {
    https.get({
      agent: agentkeepalive,
      port: port,
      path: '/',
      rejectUnauthorized: false,
    }, function (res) {
      res.should.status(200);
      res.resume();
      res.on('end', function () {
        process.nextTick(function () {
          Object.keys(agentkeepalive.sockets).should.length(0);
          Object.keys(agentkeepalive.freeSockets).should.length(1);
          // wait for timeout
          setTimeout(function () {
            Object.keys(agentkeepalive.sockets).should.length(0);
            Object.keys(agentkeepalive.freeSockets).should.length(0);
            done();
          }, 1500);
        });
      });
    });
    Object.keys(agentkeepalive.sockets).should.length(1);
  });

  it('should GET / and /foo use the same socket', function (done) {
    var options = {
      port: port,
      path: '/',
      agent: agentkeepalive,
      rejectUnauthorized: false,
    };
    var remotePort = null;
    https.get(options, function (res) {
      res.should.status(200);
      var data = null;
      res.on('data', function (chunk) {
        data = JSON.parse(chunk);
      });
      res.on('end', function () {
        data.should.have.property('remotePort');
        data.should.have.property('url', '/');
        remotePort = data.remotePort;

        // request again
        options.path = '/foo';
        process.nextTick(function () {
          https.get(options, function (res) {
            res.should.status(200);
            var data = null;
            res.on('data', function (chunk) {
              data = JSON.parse(chunk);
            });
            res.on('end', function () {
              data.should.have.property('remotePort', remotePort);
              data.should.have.property('url', '/foo');
              process.nextTick(function () {
                Object.keys(agentkeepalive.sockets).should.length(0);
                Object.keys(agentkeepalive.freeSockets).should.length(1);
                done();
              });
            });
          });
        });
      });
    });
  });
});
