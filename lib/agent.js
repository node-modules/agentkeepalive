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

function Agent(options) {
  http.Agent.call(this, options);

  var self = this;
  self.unusedSockets = {};

  // override the `free` event listener
  self.removeAllListeners('free');
  self.on('free', function (socket, host, port, localAddress) {
    var name = host + ':' + port;
    if (localAddress) {
      name += ':' + localAddress;
    }
    
    if (self.requests[name] && self.requests[name].length) {
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
  if (this.unusedSockets[name] && this.unusedSockets[name].length) {
    req.onSocket(this.unusedSockets[name].shift());
    return;
  }
  return http.Agent.prototype.addRequest.call(this, req, host, port, localAddress);
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
  http.Agent.prototype.removeSocket.call(this, s, name, host, port, localAddress);
};