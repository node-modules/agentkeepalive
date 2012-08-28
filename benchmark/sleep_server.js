/*!
 * agentkeepalive - benchmark/sleep_server.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var http = require('http');

var count = 0;
http.createServer(function (req, res) {
  var size = 0;
  var data = '';
  req.on('data', function (chunk) {
    size += chunk.length;
    data += chunk;
  });
  req.on('end', function () {
    var timeout = parseInt(req.url.substring(1), 10) || 1; // default 1ms
    setTimeout(function () {
      var result = {
        timeout: timeout,
        headers: req.headers,
        size: size,
        data: data
      };
      res.socket.setNoDelay(true);
      res.end(JSON.stringify(result));
    }, timeout);
  });
}).listen(1984);

console.log('sleep server start, listen on 1984');