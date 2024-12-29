'use strict';

const assert = require('assert');
const http = require('http');
const HttpAgent = require('..').HttpAgent;

describe('test/server_timeout.test.js', () => {
  let port;
  let server;
  let timer;
  before(done => {
    server = http.createServer((req, res) => {
      if (server.keepAliveTimeout) {
        res.setHeader('Keep-Alive', `timeout=${parseInt(server.keepAliveTimeout / 1000)}`);
      }
      res.end('Hello World, ' + req.connection.remotePort);
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.keepAliveTimeout = 1000;
    server.listen(0, err => {
      port = server.address().port;
      done(err);
    });
  });

  after(() => {
    clearInterval(timer);
  });

  it('should handle Keep-Alive header and not throw reset error', done => {
    const keepaliveAgent = new HttpAgent({
      keepAlive: true,
    });

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
          assert(res.headers['keep-alive'] === 'timeout=1');
          const m = /^timeout=(\d+?)/.exec(res.headers['keep-alive']);
          if (m) {
            const keepAliveTimeout = parseInt(m[1]) * 1000 - 500;
            if (keepAliveTimeout > 0) {
              req.socket.freeSocketKeepAliveTimeout = keepAliveTimeout;
            }
          }
          if (count > 5) {
            done();
          }
        });
      });
      req.on('error', err => {
        console.error('[%s] error: %s', count, err);
        done(err);
      });
      req.end();
    }

    timer = setInterval(request, server.keepAliveTimeout);
    request();
  });
});
