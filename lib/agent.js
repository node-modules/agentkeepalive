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
var util = require('util');

var debug;
if (process.env.NODE_DEBUG && /agentkeepalive/.test(process.env.NODE_DEBUG)) {
  debug = function(x) {
    console.error('agentkeepalive:', x);
  };
} else {
  debug = function() { };
}

function Agent(options) {
  options = options || {};
  http.Agent.call(this, options);

  var self = this;
  // max keep alive time, default 60 seconds.
  // if set `maxKeepAliveTime = 0`, will disable keepalive feature.
  self.maxKeepAliveTime = parseInt(options.maxKeepAliveTime, 10);
  if (isNaN(self.maxKeepAliveTime)) {
    self.maxKeepAliveTime = 60000;
  }
  self.unusedSockets = {};
  self.createSocketCount = 0;
  self.timeoutSocketCount = 0;

  // override the `free` event listener
  self.removeAllListeners('free');
  self.on('free', function (socket, host, port, localAddress) {
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
      
      if (self.maxKeepAliveTime === 0) {
        socket.destroy();
        return;
      }

      // keepalive
      if (!self.unusedSockets[name]) {
        self.unusedSockets[name] = [];
      }
      // socket.__lastActiveTimestamp = Date.now();
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
  var s = http.Agent.prototype.createSocket.call(this, name, host, port, localAddress, req);
  if (self.maxKeepAliveTime) {
    s.setTimeout(self.maxKeepAliveTime, function () {
      s.destroy();
      self.timeoutSocketCount++;
    });
    // Disable Nagle's algorithm: http://blog.caustik.com/2012/04/08/scaling-node-js-to-100k-concurrent-connections/
    s.setNoDelay(true);
  }
  this.createSocketCount++;
  return s;
};

Agent.prototype.removeSocket = function (s, name, host, port, localAddress) {
  if (this.unusedSockets[name]) {
    var unusedIndex = this.unusedSockets[name].indexOf(s);
    if (unusedIndex !== -1) {
      this.unusedSockets[name].splice(unusedIndex, 1);
      if (this.unusedSockets[name].length === 0) {
        // don't leak
        delete this.unusedSockets[name];
      }
    }
  }
  return http.Agent.prototype.removeSocket.call(this, s, name, host, port, localAddress);
};