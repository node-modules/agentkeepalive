'use strict';

const assert = require('assert');
const http = require('http');
const Agent = require('..');

const keepaliveAgent = new Agent({
  keepAlive: true,
});
const server = http.createServer((req, res) => {
  if (server.keepAliveTimeout) {
    res.setHeader('Keep-Alive', `time=${parseInt(server.keepAliveTimeout / 1000)}`);
  }
  res.end('Hello World, ' + req.connection.remotePort);
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

const port = 3000;
server.listen(port);
server.keepAliveTimeout = 1000;

let count = 0;
function request() {
  count++;
  const req = http.request({
    method: 'GET',
    port,
    path: '/',
    agent: keepaliveAgent,
  }, res => {
    assert(res.statusCode === 200);
    const chunks = [];
    res.on('data', data => {
      chunks.push(data);
    });
    res.on('end', () => {
      const text = Buffer.concat(chunks).toString();
      console.log('[%s] status: %s, text: %s, headers: %j', count, text, res.statusCode, res.headers);
      assert(res.headers.connection === 'keep-alive');
      assert(res.headers['keep-alive'] === 'time=1');
      const m = /^time=(\d+?)/.exec(res.headers['keep-alive']);
      if (m) {
        const keepAliveTimeout = parseInt(m[1]) * 1000 - 500;
        if (keepAliveTimeout > 0) {
          res.socket.freeSocketKeepAliveTimeout = keepAliveTimeout;
        }
      }
      if (count > 5) {
        process.exit(0);
      }
    });
  });
  req.on('error', err => {
    console.error('[%s] error: %s', count, err);
    throw err;
  });
  req.end();
}

setInterval(request, server.keepAliveTimeout);
request();
