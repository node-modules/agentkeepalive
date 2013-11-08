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
var SERVER = process.argv[3] || '127.0.0.1';

var agentKeepalive = new Agent({
  keepAlive: true,
  maxSockets: maxSockets,
  maxFreeSockets: maxSockets,
  maxKeepAliveTime: 30000,
});
var agentHttp = new http.Agent({
  maxSockets: maxSockets
});
agentHttp.createSocketCount = 0;
agentHttp.requestFinishedCount = 0;
agentHttp.__createSocket = agentHttp.createSocket;
agentHttp.createSocket = function (name, host, port, localAddress, req) {
  agentHttp.createSocketCount++;
  return agentHttp.__createSocket(name, host, port, localAddress, req);
};
agentHttp.on('free', function () {
  agentHttp.requestFinishedCount++;
});
var count = 0;
var rtKeepalives = {
  ' <10ms': 0,
  ' <15ms': 0,
  ' <20ms': 0,
  ' <30ms': 0,
  ' <40ms': 0,
  ' <50ms': 0,
  ' <100ms': 0,
  ' <150ms': 0,
  ' <200ms': 0,
  ' >=200ms+': 0
};

var rtNormals = {
  ' <10ms': 0,
  ' <15ms': 0,
  ' <20ms': 0,
  ' <30ms': 0,
  ' <40ms': 0,
  ' <50ms': 0,
  ' <100ms': 0,
  ' <150ms': 0,
  ' <200ms': 0,
  ' >=200ms+': 0
};

setInterval(function () {
  var name = SERVER + ':1984';
  console.log('----------------------------------------------------------------');
  console.log('[proxy.js:%d] keepalive, %d created, %d requestFinished, %d req/socket, %s requests, %s sockets, %s freeSockets, %d timeout\n%j',
    count,
    agentKeepalive.createSocketCount,
    agentKeepalive.requestFinishedCount,
    (agentKeepalive.requestFinishedCount / agentKeepalive.createSocketCount || 0).toFixed(2),
    agentKeepalive.requests[name] && agentKeepalive.requests[name].length || 0,
    agentKeepalive.sockets[name] && agentKeepalive.sockets[name].length || 0,
    agentKeepalive.freeSockets[name] && agentKeepalive.freeSockets[name].length || 0,
    agentKeepalive.timeoutSocketCount,
    rtKeepalives
  );
  console.log('----------------------------------------------------------------');
  console.log('[proxy.js:%d] normal   , %d created, %d requestFinished, %d req/socket, %s requests, %s sockets\n%j',
    count,
    agentHttp.createSocketCount,
    agentHttp.requestFinishedCount,
    (agentHttp.requestFinishedCount / agentHttp.createSocketCount || 0).toFixed(2),
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
    host: SERVER,
    port: 1984,
    path: path,
    method: method,
    agent: agent
  };
  req.on('data', function () {});
  req.on('end', function () {
    var timer = null;
    var start = Date.now();
    var client = http.request(options, function (response) {
      response.pipe(res);
      response.once('end', function () {
        var use = Date.now() - start;
        if (use < 10) {
          rts[' <10ms']++;
        } else if (use < 15) {
          rts[' <15ms']++;
        } else if (use < 20) {
          rts[' <20ms']++;
        } else if (use < 30) {
          rts[' <30ms']++;
        } else if (use < 40) {
          rts[' <40ms']++;
        } else if (use < 50) {
          rts[' <50ms']++;
        } else if (use < 100) {
          rts[' <100ms']++;
        } else if (use < 150) {
          rts[' <150ms']++;
        } else if (use < 200) {
          rts[' <200ms']++;
        } else {
          rts[' >=200ms+']++;
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
      console.log('2000ms timeout ' + req.url);
      timer = null;
      client.abort();
    }, 2000);
    client.end(postData);
  });
  

}).listen(1985);

console.log('proxy start, listen on 1985');
