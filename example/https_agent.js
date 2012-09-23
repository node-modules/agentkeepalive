var https = require('https');
var HttpsAgent = require('../').HttpsAgent;

var keepaliveAgent = new HttpsAgent();
// https://www.google.com/search?q=nodejs&sugexp=chrome,mod=12&sourceid=chrome&ie=UTF-8
var options = {
  host: 'www.google.com',
  port: 443,
  path: '/search?q=nodejs&sugexp=chrome,mod=12&sourceid=chrome&ie=UTF-8',
  method: 'GET',
  agent: keepaliveAgent
};

var req = https.request(options, function (res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function (e) {
  console.log('problem with request: ' + e.message);
});
req.end();

setTimeout(function () {
  console.log('keep alive sockets:');
  console.log(keepaliveAgent.unusedSockets);
  process.exit();
}, 2000);