'use strict';

const assert = require('assert');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { HttpAgent, HttpsAgent } = require('..');

[
  { Agent: HttpAgent, client: http },
  { Agent: HttpsAgent, client: https },
].forEach(({ Agent, client }) => {
  describe(`test/default_timeout.test.js ${Agent.name}`, () => {
    [ 'freeSocketTimeout', 'keepAliveTimeout', 'freeSocketKeepAliveTimeout' ].forEach(option => {
      [
        { value: '10s', freeSocketTimeout: 10000, timeout: 20000 },
        { value: '100ms', freeSocketTimeout: 100, timeout: 8000 },
      ].forEach(({ value, freeSocketTimeout, timeout }) => {
        it(`should derive the default timeout from ${option}: ${value}`, () => {
          const agent = new Agent({ [option]: value });
          assert.strictEqual(agent.options.freeSocketTimeout, freeSocketTimeout);
          assert.strictEqual(agent.options.timeout, timeout);
        });
      });
    });

    [
      { value: 10000, freeSocketTimeout: 10000, timeout: 20000 },
      { value: '10000', freeSocketTimeout: 10000, timeout: 20000 },
      { value: 0, freeSocketTimeout: 0, timeout: 8000 },
      { value: undefined, freeSocketTimeout: 4000, timeout: 8000 },
    ].forEach(({ value, freeSocketTimeout, timeout }) => {
      it(`should preserve the default timeout for freeSocketTimeout: ${value}`, () => {
        const agent = new Agent({ freeSocketTimeout: value });
        assert.strictEqual(agent.options.freeSocketTimeout, freeSocketTimeout);
        assert.strictEqual(agent.options.timeout, timeout);
      });
    });

    [ 500, '20s', 0 ].forEach(timeout => {
      it(`should preserve explicit timeout: ${timeout}`, () => {
        const agent = new Agent({ freeSocketTimeout: '10s', timeout });
        assert.strictEqual(agent.options.freeSocketTimeout, 10000);
        assert.strictEqual(agent.options.timeout, timeout === '20s' ? 20000 : timeout);
      });
    });

    it('should derive the default timeout after applying legacy option precedence', () => {
      const agent = new Agent({
        freeSocketTimeout: '5s',
        keepAliveTimeout: '6s',
        freeSocketKeepAliveTimeout: '10s',
      });
      assert.strictEqual(agent.options.freeSocketTimeout, 10000);
      assert.strictEqual(agent.options.timeout, 20000);
    });

    describe('working socket', () => {
      let server;
      let agent;

      before(done => {
        const onRequest = req => {
          // Leave the request active until the agent's inactivity timeout expires.
          req.resume();
        };
        server = client === https ? https.createServer({
          key: fs.readFileSync(__dirname + '/fixtures/agenttest-key.pem'),
          cert: fs.readFileSync(__dirname + '/fixtures/agenttest-cert.pem'),
        }, onRequest) : http.createServer(onRequest);
        server.listen(0, done);
      });

      afterEach(() => agent.destroy());
      after(done => server.close(done));

      it('should time out an active request with a humanized free socket timeout', function(done) {
        this.timeout(12000);
        agent = new Agent({ freeSocketTimeout: '100ms' });
        client.get({
          agent,
          port: server.address().port,
          rejectUnauthorized: false,
        }, () => {
          done(new Error('should not receive a response'));
        }).on('error', err => {
          assert.strictEqual(err.code, 'ERR_SOCKET_TIMEOUT');
          assert.strictEqual(err.timeout, 8000);
          done();
        });
      });
    });
  });
});
