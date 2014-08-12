/**!
 * agentkeepalive - lib/agent.js
 *
 * refer:
 *   * @atimb "Real keep-alive HTTP agent": https://gist.github.com/2963672
 *   * https://github.com/joyent/node/blob/master/lib/http.js
 *   * https://github.com/joyent/node/blob/master/lib/https.js
 *   * https://github.com/joyent/node/blob/master/lib/_http_agent.js
 *
 * Copyright(c) 2012 - 2014 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var util = require('util');
var https = require('https');
var debug = util.debuglog('http');

var OriginalAgent = require('./_http_agent').Agent;
var OriginalHttpsAgent = https.Agent;

function Agent(options) {
  if (!(this instanceof Agent)) {
    return new Agent(options);
  }
    
  options = options || {};
  // default is keep-alive and 15s free socket timeout
  options.keepAlive = options.keepAlive !== false;
  options.keepAliveTimeout = options.keepAliveTimeout || 15000;
  OriginalAgent.call(this, options);
}

util.inherits(Agent, OriginalAgent);
module.exports = Agent;

Agent.prototype.createSocket = function (req, options) {
  var socket = OriginalAgent.prototype.createSocket.call(this, req, options);
  if (this.keepAlive) {
    // Disable Nagle's algorithm: http://blog.caustik.com/2012/04/08/scaling-node-js-to-100k-concurrent-connections/
    socket.setNoDelay(true);
  }
  return socket;
};

function HttpsAgent(options) {
  Agent.call(this, options);
  this.defaultPort = 443;
  this.protocol = 'https:';
}

util.inherits(HttpsAgent, Agent);

HttpsAgent.prototype.createConnection = OriginalHttpsAgent.prototype.createConnection;
HttpsAgent.prototype.getName = OriginalHttpsAgent.prototype.getName;

Agent.HttpsAgent = HttpsAgent;
