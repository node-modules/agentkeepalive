'use strict';

const https = require('https');
const HttpsAgent = require('..').HttpsAgent;

const agent = new HttpsAgent();
// https://www.google.com/search?q=nodejs&sugexp=chrome,mod=12&sourceid=chrome&ie=UTF-8
const options = {
  host: 'github.com',
  port: 443,
  path: '/',
  method: 'GET',
  agent,
};

let start = Date.now();
const req = https.request(options, res => {
  console.log('STATUS1: %d, %d ms', res.statusCode, Date.now() - start);
  console.log('HEADERS1: %j', res.headers);
  res.setEncoding('utf8');
  res.on('data', chunk => {
    console.log('BODY1: %d', chunk.length);
  });
  res.on('end', () => {
    process.nextTick(() => {
      start = Date.now();
      https.get(options, res => {
        console.log('STATUS2: %d, %d ms', res.statusCode, Date.now() - start);
        console.log('HEADERS2: %j', res.headers);
        res.setEncoding('utf8');
        res.on('data', chunk => {
          console.log('BODY2: %d', chunk.length);
        });
      });
    });
  });
});

req.on('error', e => {
  console.log('problem with request: ' + e.message);
});
req.end();

setTimeout(() => {
  console.log('keep alive sockets:', agent);
  process.exit();
}, 5000);
