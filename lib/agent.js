/*!
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

if (typeof http.Agent.request === 'function') {
  // node >= 0.11, default Agent is keepavlie
  module.exports = http.Agent;
  module.exports.HttpsAgent = https.Agent;
  return;
}


var Agent = require('./_http_agent').Agent;
module.exports = Agent;

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
