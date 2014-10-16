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

describe.only('https_agent.test.js', function () {

  var agentkeepalive = new HttpsAgent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 5,
    maxFreeSockets: 5,
  });

  it('should GET / success with 200 status', function (done) {
    agentkeepalive.get({
      hostname: "www.google.com",
      port: 443,
      path: '/search?q=nodejs',
    }, function (res) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('should GET /search?q=nodejs /search?q=agentkeepalive use the same socket', function (done) {
    var options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/search?q=nodejs',
      agent: agentkeepalive,
    };
    var remotePort = null;
    agentkeepalive.get(options, function (res) {
      Object.keys(agentkeepalive.sockets).should.length(1);
      Object.keys(agentkeepalive.freeSockets).should.length(0);
      res.statusCode.should.equal(200);
      res.on('data', function (chunk) {});
      res.on('end', function () {
        Object.keys(agentkeepalive.sockets).should.length(1);
        Object.keys(agentkeepalive.freeSockets).should.length(0);
        // request again
        options.path = '/search?q=agentkeepalive';
        process.nextTick(function () {
          Object.keys(agentkeepalive.sockets).should.length(1);
          Object.keys(agentkeepalive.freeSockets).should.length(1);
          https.get(options, function (res) {
            Object.keys(agentkeepalive.sockets).should.length(1);
            Object.keys(agentkeepalive.freeSockets).should.length(0);
            res.statusCode.should.equal(200);
            var data = null;
            res.on('data', function (chunk) {});
            res.on('end', function () {
              Object.keys(agentkeepalive.sockets).should.length(1);
              Object.keys(agentkeepalive.freeSockets).should.length(0);
              process.nextTick(function () {
                Object.keys(agentkeepalive.sockets).should.length(1);
                Object.keys(agentkeepalive.freeSockets).should.length(1);
                console.log(agentkeepalive);
                done();
              });
            });
          });
        });
      });
    });
  });

  it('should have remove sockets after timeout', function (done) {
    this.timeout(2500);
    var options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/search?q=nodejs',
      agent: agentkeepalive,
    };
    var remotePort = null;
    agentkeepalive.get(options, function (res) {
      Object.keys(agentkeepalive.sockets).should.length(1);
      Object.keys(agentkeepalive.freeSockets).should.length(0);
      res.statusCode.should.equal(200);
      res.on('data', function (chunk) {});
      res.on('end', function () {
        Object.keys(agentkeepalive.sockets).should.length(1);
        Object.keys(agentkeepalive.freeSockets).should.length(0);
        // request again
        options.path = '/search?q=agentkeepalive';
        process.nextTick(function () {
          Object.keys(agentkeepalive.sockets).should.length(1);
          Object.keys(agentkeepalive.freeSockets).should.length(1);
          setTimeout(function() {
            Object.keys(agentkeepalive.sockets).should.length(0);
            Object.keys(agentkeepalive.freeSockets).should.length(0);
            done();
          }, 2000);        
        });
      });
    });
  });
});
