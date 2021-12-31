'use strict';

const assert = require('assert');
const http = require('http');
const Agent = require('..');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// https://medium.com/ssense-tech/reduce-networking-errors-in-nodejs-23b4eb9f2d83
describe('test/test-ECONNRESET.test.js', () => {
  let port;
  let server;
  let timer;
  before(done => {
    server = http.createServer((req, res) => {
      res.end('Hello World');
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
    const keepaliveAgent = new Agent({
      keepAlive: true,
      freeSocketTimeout: 900,
    });

    function request() {
      return new Promise((resolve, reject) => {
        const req = http.request({
          method: 'GET',
          port,
          path: '/',
          agent: keepaliveAgent,
        }, res => {
          const chunks = [];
          res.on('data', data => {
            chunks.push(data);
          });
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString();
            resolve(text);
          });
        });
        req.on('error', err => {
          reject(err);
        });
        req.end();
      });
    }

    async function startSendingRequests() {
      let successes = 0;
      const failures = {};

      for (let i = 0; i < 10; i++) {
        await wait(999);
        try {
          await request();
          successes++;
        } catch (e) {
          failures[e.message] = (failures[e.message] || 0) + 1;
        }
      }
      return { successes, failures };
    }

    startSendingRequests().then(({ successes, failures }) => {
      assert(Object.keys(failures).length === 0);
      assert(successes === 10);
      done();
    });
  });
});
