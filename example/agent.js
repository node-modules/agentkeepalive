var http = require('http');
var Agent = require('../');

var keepaliveAgent = new Agent({
  keepAlive: true
});
// https://www.google.com/search?q=nodejs&sugexp=chrome,mod=12&sourceid=chrome&ie=UTF-8
var options = {
  host: 'gitcafe.com',
  path: '/',
  method: 'GET',
  agent: keepaliveAgent
};

var start = Date.now();
var req = http.get(options, function (res) {
  console.log('STATUS1: %d, %d ms', res.statusCode, Date.now() - start);
  console.log('HEADERS1: %j', res.headers);
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY1: %d', chunk.length);
  });
  res.on('end', function () {
    process.nextTick(function () {
      start = Date.now();
      http.get(options, function (res) {
        console.log('STATUS2: %d, %d ms', res.statusCode, Date.now() - start);
        console.log('HEADERS2: %j', res.headers);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY2: %d', chunk.length);
        });
      });
    });
  });
});
req.on('error', function (e) {
  console.log('problem with request: ' + e.message);
});

setTimeout(function () {
  console.log('keep alive sockets:', keepaliveAgent);
  process.exit();
}, 3000);
