/**!
 * agentkeepalive - lib/agent.js
 *
 * refer:
 *   * @atimb "Real keep-alive HTTP agent": https://gist.github.com/2963672
 *   * https://github.com/joyent/node/blob/master/lib/http.js
 *   * https://github.com/joyent/node/blob/master/lib/_http_agent.js
 *
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>
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
    console.error.apply(console, arguments);
  };
} else {
  debug = function () { };
}

var OriginalAgent = http.Agent;

if (process.version.indexOf('v0.8.') === 0 || process.version.indexOf('v0.10.') === 0) {
  OriginalAgent = require('./_http_agent').Agent;
  debug('%s use _http_agent', process.version);
}

function Agent(options) {
  options = options || {};
  options.keepAlive = options.keepAlive !== false;
  options.keepAliveMsecs = options.keepAliveMsecs || options.maxKeepAliveTime;
  OriginalAgent.call(this, options);

  var self = this;
  // max requests per keepalive socket, default is 0, no limit.
  self.maxKeepAliveRequests = parseInt(options.maxKeepAliveRequests, 10) || 0;
  // max keep alive time, default 60 seconds.
  // if set `keepAliveMsecs = 0`, will disable keepalive feature.
  self.createSocketCount = 0;
  self.timeoutSocketCount = 0;
  self.requestFinishedCount = 0;

  // override the `free` event listener
  self.removeAllListeners('free');
  self.on('free', function (socket, options) {
    self.requestFinishedCount++;
    socket._requestCount++;

    var name = self.getName(options);
    debug('agent.on(free)', name);

    if (!self.isDestroyed(socket) &&
        self.requests[name] && self.requests[name].length) {
      self.requests[name].shift().onSocket(socket);
      if (self.requests[name].length === 0) {
        // don't leak
        delete self.requests[name];
      }
    } else {
      // If there are no pending requests, then put it in
      // the freeSockets pool, but only if we're allowed to do so.
      var req = socket._httpMessage;
      if (req &&
          req.shouldKeepAlive &&
          !self.isDestroyed(socket) &&
          self.options.keepAlive) {
        var freeSockets = self.freeSockets[name];
        var freeLen = freeSockets ? freeSockets.length : 0;
        var count = freeLen;
        if (self.sockets[name])
          count += self.sockets[name].length;
        if (count > self.maxSockets || freeLen >= self.maxFreeSockets) {
          self.removeSocket(socket, options);
          socket.destroy();
        } else {
          freeSockets = freeSockets || [];
          self.freeSockets[name] = freeSockets;
          socket.setKeepAlive(true, self.keepAliveMsecs);
          socket.unref && socket.unref();
          socket._httpMessage = null;
          self.removeSocket(socket, options);
          freeSockets.push(socket);

          // Avoid duplicitive timeout events by removing timeout listeners set on
          // socket by previous requests. node does not do this normally because it
          // assumes sockets are too short-lived for it to matter. It becomes a
          // problem when sockets are being reused. Steps are being taken to fix
          // this issue upstream in node v0.10.0.
          //
          // See https://github.com/joyent/node/commit/451ff1540ab536237e8d751d241d7fc3391a4087
          if (self.keepAliveMsecs && socket._events && Array.isArray(socket._events.timeout)) {
            socket.removeAllListeners('timeout');
            // Restore the socket's setTimeout() that was remove as collateral
            // damage.
            socket.setTimeout(self.keepAliveMsecs, socket._maxKeepAliveTimeout);
          }
        }
      } else {
        self.removeSocket(socket, options);
        socket.destroy();
      }
    }
  });
}

util.inherits(Agent, OriginalAgent);
module.exports = Agent;

Agent.prototype.createSocket = function (req, options) {
  var self = this;
  var socket = OriginalAgent.prototype.createSocket.call(this, req, options);
  socket._requestCount = 0;
  if (self.keepAliveMsecs) {
    socket._maxKeepAliveTimeout = function () {
      debug('maxKeepAliveTimeout, socket destroy()');
      socket.destroy();
      self.timeoutSocketCount++;
    };
    socket.setTimeout(self.keepAliveMsecs, socket._maxKeepAliveTimeout);
    // Disable Nagle's algorithm: http://blog.caustik.com/2012/04/08/scaling-node-js-to-100k-concurrent-connections/
    socket.setNoDelay(true);
  }
  this.createSocketCount++;
  return socket;
};

Agent.prototype.removeSocket = function (s, options) {
  OriginalAgent.prototype.removeSocket.call(this, s, options);
  var name = this.getName(options);
  debug('removeSocket', name, 'destroyed:', this.isDestroyed(s));

  if (this.isDestroyed(s) && this.freeSockets[name]) {
    var index = this.freeSockets[name].indexOf(s);
    if (index !== -1) {
      this.freeSockets[name].splice(index, 1);
      if (this.freeSockets[name].length === 0) {
        // don't leak
        delete this.freeSockets[name];
      }
    }
  }
};

function HttpsAgent(options) {
  Agent.call(this, options);
  this.defaultPort = 443;
  this.protocol = 'https:';
}
util.inherits(HttpsAgent, Agent);
HttpsAgent.prototype.createConnection = https.globalAgent.createConnection;

HttpsAgent.prototype.getName = function(options) {
  var name = Agent.prototype.getName.call(this, options);

  name += ':';
  if (options.ca)
    name += options.ca;

  name += ':';
  if (options.cert)
    name += options.cert;

  name += ':';
  if (options.ciphers)
    name += options.ciphers;

  name += ':';
  if (options.key)
    name += options.key;

  name += ':';
  if (options.pfx)
    name += options.pfx;

  name += ':';
  if (options.rejectUnauthorized !== undefined)
    name += options.rejectUnauthorized;

  return name;
};

Agent.HttpsAgent = HttpsAgent;
