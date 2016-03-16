// https://github.com/indutny/io.js/blob/b9b79fdbed704cb647700d799b94f15e88124763/test/parallel/test-https-agent-session-eviction.js

var https = require('https');
var assert = require('assert');
var fs = require('fs');
var constants = require('constants');
var HttpsAgent = require('..').HttpsAgent;
var utils = require('../lib/utils');

describe('test/test-https-agent-session-eviction.test.js', function() {
  var port;
  var server;
  var httpsAgent = new HttpsAgent({
    keepAlive: true,
  });
  var options = {
    key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
    cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
    secureOptions: constants.SSL_OP_NO_TICKET,
  };

  before(function(done) {
    if (utils.isNode10) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    }
    // Create TLS1.2 server
    server = https.createServer(options, function(req, res) {
      res.end('ohai');
    });
    server.listen(0, function() {
      port = this.address().port;
      done();
    });
  });

  it('should evict cached sessions on error', function(done) {
    get(server);
    // Do request and let agent cache the session
    function get(server)  {
      const req = https.request({
        port: port,
        rejectUnauthorized: false,
        agent: httpsAgent,
      }, function(res) {
        console.log('first request done, %j', res.headers);
        res.resume();
        res.on('end', function() {
          process.nextTick(function() {
            var name = Object.keys(httpsAgent.freeSockets);
            var socket = httpsAgent.freeSockets[name][0];
            socket.on('close', function(err) {
              assert.equal(err.message, 'mock close error');
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
