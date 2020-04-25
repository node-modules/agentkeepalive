// https://github.com/indutny/io.js/blob/b9b79fdbed704cb647700d799b94f15e88124763/test/parallel/test-https-agent-session-eviction.js

'use strict';

const https = require('https');
const assert = require('assert');
const fs = require('fs');
const constants = require('constants');
const HttpsAgent = require('..').HttpsAgent;

describe('test/test-https-agent-session-eviction.test.js', () => {
  let port;
  let server;
  const httpsAgent = new HttpsAgent({
    keepAlive: true,
  });
  const options = {
    key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
    cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
    secureOptions: constants.SSL_OP_NO_TICKET,
  };

  before(done => {
    // Create TLS1.2 server
    server = https.createServer(options, (req, res) => {
      res.end('ohai');
    });
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  it('should evict cached sessions on error', done => {
    get();
    // Do request and let agent cache the session
    function get() {
      const req = https.request({
        port,
        rejectUnauthorized: false,
        agent: httpsAgent,
      }, res => {
        console.log('first request done, %j', res.headers);
        res.resume();
        res.on('end', () => {
          process.nextTick(() => {
            const name = Object.keys(httpsAgent.freeSockets);
            const socket = httpsAgent.freeSockets[name][0];
            socket.on('close', err => {
              if (socket.destroyed) return;
              assert.equal(err.message, 'mock close error');
              socket.destroy();
              done();
            });
            socket.emit('close', new Error('mock close error'));
          });
        });
      });
      req.end();
    }
  });
});
