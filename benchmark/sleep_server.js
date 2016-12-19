'use strict';

const http = require('http');

http.createServer((req, res) => {
  let size = 0;
  let data = '';
  req.on('data', chunk => {
    size += chunk.length;
    data += chunk;
  });
  req.on('end', () => {
    const timeout = parseInt(req.url.substring(1), 10) || 1; // default 1ms
    setTimeout(() => {
      const result = {
        timeout,
        headers: req.headers,
        size,
        data,
      };
      res.socket.setNoDelay(true);
      res.end(JSON.stringify(result));
    }, timeout);
  });
}).listen(1984);

console.log('sleep server start, listen on 1984');
