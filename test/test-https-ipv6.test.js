'use strict';

const https = require('https');
const assert = require('assert');
const fs = require('fs');
const constants = require('constants');
const HttpsAgent = require('..').HttpsAgent;

describe('test/test-ipv6.test.js', () => {
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

  it('should GET / success with 200 status from ::1', function(done) {
    if (process.version < 'v9.1.' && process.version < 'v8.10' && process.version < 'v10.') {
      // This only works in node-versions with the fix for
      // https://github.com/nodejs/node/issues/14736 included.
      this.skip();
    }

    https.get({
      agent: httpsAgent,
      hostname: '::1',
      port,
      path: '/',
      ca: fs.readFileSync(__dirname + '/fixtures/ca.pem'),
    }, res => {
      assert(res.statusCode === 200);
      res.resume();
      res.on('end', () => {
        process.nextTick(() => {
          assert(Object.keys(httpsAgent.sockets).length === 0);
          assert(Object.keys(httpsAgent.freeSockets).length === 1);
          done();
        });
      });
    });
    assert(Object.keys(httpsAgent.sockets).length === 1);
  });

  it('should not crash with invalid host-header', done => {
    https.get({
      agent: httpsAgent,
      hostname: '::1',
      port,
      path: '/',
      headers: {
        host: '[::1:80',
      },
      rejectUnauthorized: false,
    }, () => {
      done();
    });
  });

});
