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
var count = 0;
var rtKeepalives = {
  '10ms': 0,
  '15ms': 0,
  '20ms': 0,
  '30ms': 0,
  '40ms': 0,
  '50ms': 0,
  '50ms+': 0
};

var rtNormals = {
  '10ms': 0,
  '15ms': 0,
  '20ms': 0,
  '30ms': 0,
  '40ms': 0,
  '50ms': 0,
  '50ms+': 0
};

setInterval(function () {
  var name = 'localhost:1984';
  console.log('[proxy.js:%d] keepalive, %d created, %s requests, %s sockets, %s unusedSockets, %d timeout\n%j',
    count,
    agentKeepalive.createSocketCount,
    agentKeepalive.requests[name] && agentKeepalive.requests[name].length || 0,
    agentKeepalive.sockets[name] && agentKeepalive.sockets[name].length || 0,
    agentKeepalive.unusedSockets[name] && agentKeepalive.unusedSockets[name].length || 0,
    agentKeepalive.timeoutSocketCount,
    rtKeepalives
  );
  console.log('[proxy.js:%d] normal   , %d created, %s requests, %s sockets\n%j',
    count,
    agentHttp.createSocketCount,
    agentHttp.requests[name] && agentHttp.requests[name].length || 0,
    agentHttp.sockets[name] && agentHttp.sockets[name].length || 0,
    rtNormals
  );
}, 2000);

http.createServer(function (req, res) {
  var path = req.url;
  var agent = agentHttp;
  var method = 'GET';
  var postData = null;
  var rts = rtNormals;
  if (path.indexOf('/post') === 0) {
    path = path.substring(5);
    method = 'POST';
    postData = '{"sql":"select id from keepalive where age between 1 and 1000 and count between 1 and 100 order by id desc limit 2","data":null}';
  }
  if (path.indexOf('/k') === 0) {
    path = path.substring(2);
    agent = agentKeepalive;
    rts = rtKeepalives;
  }
  var options = {
    host: 'localhost',
    port: 1984,
    path: path,
    method: method,
    agent: agent
  };
  var timer = null;
  var start = Date.now();
  var client = http.request(options, function (response) {
    response.pipe(res);
    response.once('end', function () {
      var use = Date.now() - start;
      if (use < 10) {
        rts['10ms']++;
      } else if (use < 15) {
        rts['15ms']++;
      } else if (use < 20) {
        rts['20ms']++;
      } else if (use < 30) {
        rts['30ms']++;
      } else if (use < 40) {
        rts['40ms']++;
      } else if (use < 50) {
        rts['50ms']++;
      } else {
        rts['50ms+']++;
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      count++;
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
  client.end(postData);

}).listen(1985);

console.log('proxy start, listen on 1985');