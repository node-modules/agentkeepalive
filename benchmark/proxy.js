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
var AgentKeepalive = require('../');

var maxSockets = parseInt(process.argv[2]) || 10;
var maxFreeSockets = parseInt(process.argv[3]) || maxSockets;
var SERVER = process.argv[4] || '127.0.0.1';

var agentKeepalive = new AgentKeepalive({
  keepAlive: true,
  maxSockets: maxSockets,
  maxFreeSockets: maxFreeSockets,
  keepAliveTimeout: 30000,
});
var agentHttp = new AgentKeepalive({
  maxSockets: maxSockets,
  keepAlive: false,
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
  console.log('\n\n----------------------------------------------------------------');
  console.log('[proxy.js:%d] keepalive, %d created, %d requests, %d req/socket, %d close, %d timeout\n%j',
    count,
    agentKeepalive.createSocketCount,
    agentKeepalive.requestCount,
    (agentKeepalive.requestCount / agentKeepalive.createSocketCount || 0).toFixed(2),
    agentKeepalive.closeSocketCount,
    agentKeepalive.timeoutSocketCount,
    rtKeepalives
  );
  for (var name in agentKeepalive.sockets) {
    console.log('sockets %s: %d', name, agentKeepalive.sockets[name].length);
  }
  for (var name in agentKeepalive.freeSockets) {
    console.log('freeSockets %s: %d', name,
      agentKeepalive.freeSockets[name].length || 0);
  }
  for (var name in agentKeepalive.requests) {
    console.log('requests %s: %d', name,
      agentKeepalive.requests[name].length || 0);
  }

  console.log('----------------------------------------------------------------');
  console.log('[proxy.js:%d] normal   , %d created, %d requests, %d req/socket, %d close\n%j',
    count,
    agentHttp.createSocketCount,
    agentHttp.requestCount,
    (agentHttp.requestCount / agentHttp.createSocketCount || 0).toFixed(2),
    agentHttp.closeSocketCount,
    rtNormals
  );
  for (var name in agentHttp.sockets) {
    console.log('sockets %s: %d', name, agentHttp.sockets[name].length);
  }
  for (var name in agentHttp.freeSockets) {
    console.log('freeSockets %s: %d', name,
      agentHttp.freeSockets[name].length || 0);
  }
  for (var name in agentHttp.requests) {
    console.log('requests %s: %d', name,
      agentHttp.requests[name].length || 0);
  }
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
      // console.log('error ' + req.url + ':' + err.message);
      res.statusCode = 500;
      res.end(err.message);
    });
    timer = setTimeout(function () {
      // console.log('2000ms timeout ' + req.url);
      timer = null;
      client.abort();
    }, 2000);
    client.end(postData);
  });
}).listen(1985);

console.log('proxy start, listen on 1985');
