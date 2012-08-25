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

var maxSockets = parseInt(process.argv[2], 10) || 10;

var agentKeepalive = new Agent({
  maxSockets: maxSockets,
  maxKeepAliveTime: 30000,
});
var agentHttp = new http.Agent({
  maxSockets: maxSockets
});
agentHttp.createSocketCount = 0;

agentHttp.__createSocket = agentHttp.createSocket;
agentHttp.createSocket = function (name, host, port, localAddress, req) {
  agentHttp.createSocketCount++;
  return agentHttp.__createSocket(name, host, port, localAddress, req);
};

setInterval(function () {
  var name = 'localhost:1984';
  console.log('[proxy.js] keepalive, %d created, %s requests, %s sockets, %s unusedSockets',
    agentKeepalive.createSocketCount,
    agentKeepalive.requests[name] && agentKeepalive.requests[name].length || 0,
    agentKeepalive.sockets[name] && agentKeepalive.sockets[name].length || 0,
    agentKeepalive.unusedSockets[name] && agentKeepalive.unusedSockets[name].length || 0
  );
  console.log('[proxy.js] normal   , %d created, %s requests, %s sockets',
    agentHttp.createSocketCount,
    agentHttp.requests[name] && agentHttp.requests[name].length || 0,
    agentHttp.sockets[name] && agentHttp.sockets[name].length || 0
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
    console.log('error ' + req.url + ':' + err.message);
    res.statusCode = 500;
    res.end(err.message);
  });
  timer = setTimeout(function () {
    console.log('timeout ' + req.url);
    timer = null;
    client.abort();
  }, 2000);

}).listen(1985);

console.log('proxy start, listen on 1985');