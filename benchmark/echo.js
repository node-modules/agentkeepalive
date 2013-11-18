/*!
 * agentkeepalive - benchmark/echo.js
 * 
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Agent = require('../');

var agent = new Agent({
  keepAlive: true,
  maxSockets: 2,
  maxFreeSockets: 2,
  keepAliveMsecs: 30000,
});

var options = {
  host: '10.125.196.152',
  port: 1984,
  path: '/1',
  method: 'GET',
};

function get() {
  agent.get(options, function (res) {
    var size = 0;
    res.on('data', function (c) {
      size += c.length;
    }).on('end', function () {
      console.log('got %d bytes', size);
    });
  }).on('error', function (err) {
    console.log('got error: %s', err);
  });
}

setInterval(function () {
  get();
  get();
}, 1000);
get();


function showAgentDetail() {
  var peddingRequests = {};
  for (var k in agent.requests) {
    var reqs = agent.requests[k];
    peddingRequests[k] = reqs && reqs.length || 0;
  }
  var totalSockets = {};
  for (var k in agent.sockets) {
    var socks = agent.sockets[k];
    totalSockets[k] = socks && socks.length || 0;
  }
  var freeSockets = {};
  for (var k in agent.freeSockets) {
    var socks = agent.freeSockets[k];
    freeSockets[k] = socks && socks.length || 0;
  }

  var requestPerSocket = agent.createSocketCount && agent.requestFinishedCount / agent.createSocketCount;
  console.log('[%s] [worker:%d] Agent(%s,%sms,%s,%s): requests: %d, created: %d, timeout: %d, reqs/socket: %s, pedding requests: %j, alive sockets: %j, free sockets: %j',
    Date(), process.pid,
    agent.keepAlive && agent.options.keepAlive, agent.keepAliveMsecs,
    agent.maxSockets, agent.maxFreeSockets,
    agent.requestFinishedCount, agent.createSocketCount, agent.timeoutSocketCount,
    requestPerSocket.toFixed(0),
    peddingRequests, totalSockets, freeSockets
  );
}

setInterval(showAgentDetail, 3000);
