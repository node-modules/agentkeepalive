/*!
 * agentkeepalive - lib/agent.js
 *
 * refer: 
 *   * @atimb "Real keep-alive HTTP agent": https://gist.github.com/2963672
 *   * https://github.com/joyent/node/blob/master/lib/http.js
 * 
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var http = require('http');
var https = require('https');
var util = require('util');

var debug;
if (process.env.NODE_DEBUG && /agentkeepalive/.test(process.env.NODE_DEBUG)) {
  debug = function (x) {
    console.error('agentkeepalive:', x);
  };
} else {
  debug = function () { };
}

function Agent(options) {
  options = options || {};
  http.Agent.call(this, options);

  var self = this;
  // max requests per keepalive socket, default is 0, no limit.
  self.maxKeepAliveRequests = parseInt(options.maxKeepAliveRequests, 10) || 0;
  // max keep alive time, default 60 seconds.
  // if set `maxKeepAliveTime = 0`, will disable keepalive feature.
  self.maxKeepAliveTime = parseInt(options.maxKeepAliveTime, 10);
  if (isNaN(self.maxKeepAliveTime)) {
    self.maxKeepAliveTime = 60000;
  }
  self.unusedSockets = {};
  self.createSocketCount = 0;
  self.timeoutSocketCount = 0;
  self.requestFinishedCount = 0;

  // override the `free` event listener
  self.removeAllListeners('free');
  self.on('free', function (socket, host, port, localAddress) {
    self.requestFinishedCount++;
    socket._requestCount++;
    var name = host + ':' + port;
    if (localAddress) {
      name += ':' + localAddress;
    }
    if (self.requests[name] && self.requests[name].length > 0) {
      self.requests[name].shift().onSocket(socket);
      if (self.requests[name].length === 0) {
        // don't leak
        delete self.requests[name];
      }
    } else {
      // If there are no pending requests just destroy the
      // socket and it will get removed from the pool. This
      // gets us out of timeout issues and allows us to
      // default to Connection:keep-alive.
      // socket.destroy();
      if (self.maxKeepAliveTime === 0 ||
          (self.maxKeepAliveRequests && socket._requestCount >= self.maxKeepAliveRequests)) {
        socket.destroy();
        return;
      }

      // Avoid duplicitive timeout events by removing timeout listeners set on
      // socket by previous requests. node does not do this normally because it
      // assumes sockets are too short-lived for it to matter. It becomes a
      // problem when sockets are being reused. Steps are being taken to fix
      // this issue upstream in node v0.10.0.
      //
      // See https://github.com/joyent/node/commit/451ff1540ab536237e8d751d241d7fc3391a4087
      if (self.maxKeepAliveTime && socket._events && Array.isArray(socket._events.timeout)) {
        socket.removeAllListeners('timeout');
        // Restore the socket's setTimeout() that was remove as collateral
        // damage.
        socket.setTimeout(self.maxKeepAliveTime, socket._maxKeepAliveTimeout);
      }
      // keepalive
      if (!self.unusedSockets[name]) {
        self.unusedSockets[name] = [];
      }
      self.unusedSockets[name].push(socket);
    }
  });
}

util.inherits(Agent, http.Agent);
module.exports = Agent;

Agent.prototype.addRequest = function (req, host, port, localAddress) {
  var name = host + ':' + port;
  if (localAddress) {
    name += ':' + localAddress;
  }
  if (this.unusedSockets[name] && this.unusedSockets[name].length > 0) {
    return req.onSocket(this.unusedSockets[name].shift());
  }
  return http.Agent.prototype.addRequest.call(this, req, host, port, localAddress);
};

Agent.prototype.createSocket = function (name, host, port, localAddress, req) {
  var self = this;
  var socket = http.Agent.prototype.createSocket.call(this, name, host, port, localAddress, req);
  socket._requestCount = 0;
  if (self.maxKeepAliveTime) {
    socket._maxKeepAliveTimeout = function () {
      socket.destroy();
      self.timeoutSocketCount++;
    };
    socket.setTimeout(self.maxKeepAliveTime, socket._maxKeepAliveTimeout);
    // Disable Nagle's algorithm: http://blog.caustik.com/2012/04/08/scaling-node-js-to-100k-concurrent-connections/
    socket.setNoDelay(true);
  }
  this.createSocketCount++;
  return socket;
};

Agent.prototype.removeSocket = function (socket, name, host, port, localAddress) {
  if (this.unusedSockets[name]) {
    var unusedIndex = this.unusedSockets[name].indexOf(socket);
    if (unusedIndex !== -1) {
      this.unusedSockets[name].splice(unusedIndex, 1);
      if (this.unusedSockets[name].length === 0) {
        // don't leak
        delete this.unusedSockets[name];
      }
    }
  }
  return http.Agent.prototype.removeSocket.call(this, socket, name, host, port, localAddress);
};

function HttpsAgent(options) {
  Agent.call(this, options);
  this.createConnection = https.globalAgent.createConnection;
}
util.inherits(HttpsAgent, Agent);
HttpsAgent.prototype.defaultPort = 443;

Agent.HttpsAgent = HttpsAgent;
