// http: remove excess calls to removeSocket
// https://github.com/nodejs/node/commit/6e11e220814e469cbbbe91b895362f6f11311c08

'use strict';

const assert = require('assert');
const http = require('http');

describe('test/test-http-agent-maxsockets-regress-4050.test', () => {
  it('should keep active sockets <= MAX_SOCKETS when all requests abort', done => {
    const MAX_SOCKETS = 2;

    const agent = new http.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: MAX_SOCKETS,
      maxFreeSockets: 2,
    });

    const server = http.createServer((req, res) => {
      res.end('hello world');
    });

    let port;
    const num_requests = 6;
    let finished = 0;

    function get(path) {
      const req = http.get({
        host: 'localhost',
        port,
        agent,
        path,
      }, () => {
        req.abort();
        const sockets = agent.sockets[Object.keys(agent.sockets)[0]];
        assert(sockets.length <= MAX_SOCKETS);
        if (++finished === num_requests) {
          server.close();
          done();
        }
      });
    }

    server.listen(0, () => {
      port = server.address().port;
      for (let i = 0; i < num_requests; i++) {
        get('/' + i);
      }
    });
  });
});
