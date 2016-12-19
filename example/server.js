'use strict';

const http = require('http');

http.createServer((req, res) => {
  req.resume();
  req.on('end', () => {
    res.statusCode = 200;
    res.end(req.method + ' ' + req.url);
  });
}).listen(8080);
