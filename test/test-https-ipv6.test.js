'use strict';

const https = require('https');
const assert = require('assert');
const fs = require('fs');
const constants = require('constants');
const HttpsAgent = require('..').HttpsAgent;
const os = require('os');

function isIPv6Available() {
  const networkInterfaces = os.networkInterfaces();
  return !!Object.keys(networkInterfaces).find(ifName => {
    const addresses = networkInterfaces[ifName];
    return !!addresses.find(addr => addr.family === 'IPv6');
  });
}

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

  before(function(done) {
    if (!isIPv6Available()) {
      this.skip();
    }

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
    const m = process.version.match(/^v(\d+)\.(\d+)/);
    const major = parseInt(m[1]);
    const minor = parseInt(m[2]);
    if (major < 8 || (major === 8 && minor < 10) || (major === 9 && minor < 1)) {
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
