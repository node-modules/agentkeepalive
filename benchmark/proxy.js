/*!
 * agentkeepalive - benchmark/proxy.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var http = require('http');
var Agent = require('../');

var agentKeepalive = new Agent({
  maxSockets: 10
});
var agentHttp = new http.Agent({
  maxSockets: 10
});

setInterval(function () {
  console.log('keepalive, %s requests, %s sockets, %s unusedSockets',
    agentKeepalive.requests['localhost:1984'] && agentKeepalive.requests['localhost:1984'].length,
    agentKeepalive.sockets['localhost:1984'] && agentKeepalive.sockets['localhost:1984'].length, 
    agentKeepalive.unusedSockets['localhost:1984'] && agentKeepalive.unusedSockets['localhost:1984'].length
  );
  console.log('no keepalive, %s requests, %s sockets',
    agentHttp.requests['localhost:1984'] && agentHttp.requests['localhost:1984'].length,
    agentHttp.sockets['localhost:1984'] && agentHttp.sockets['localhost:1984'].length
  );
}, 2000);

http.createServer(function (req, res) {
  var path = req.url;
  var agent = agentHttp;
  if (path.indexOf('/k') === 0) {
    path = path.substring(2);
    agent = agentKeepalive; 
  }
  var options = {
    host: 'localhost',
    port: 1984,
    path: path,
    method: 'GET',
    agent: agent
  };
  var timer = null;
  var client = http.get(options, function (response) {
    response.pipe(res);
    response.once('end', function () {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    });
  });
  client.on('error', function (err) {
    res.statusCode = 500;
    res.end(err.message);
  });
  timer = setTimeout(function () {
    console.log('timeout ' + req.url);
    timer = null;
    client.abort();
  }, 1000);

}).listen(1985);

console.log('proxy start, listen on 1985');