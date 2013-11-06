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

describe.skip('https_agent.test.js', function () {

  var app = null;
  var port = null;
  var agentkeepalive = new HttpsAgent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 5,
    maxFreeSockets: 5,
  });

  before(function (done) {
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

  it('should GET / success with 200 status', function (done) {
    agentkeepalive.get({
      port: port,
      path: '/',
    }, function (res) {
      res.should.status(200);
      done();
    });
  });

  it('should GET / and /foo use the same socket', function (done) {
    var options = {
      port: port,
      path: '/',
      agent: agentkeepalive,
    };
    var remotePort = null;
    agentkeepalive.get(options, function (res) {
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
              done();
            });
          });
        });
        
      });
    });
  });

});