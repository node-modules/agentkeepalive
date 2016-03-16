var http = require('http');
var Agent = require('../');
// var Agent = require('http').Agent;

var keepaliveAgent = new Agent({
  keepAlive: true
});
// https://www.google.com/search?q=nodejs&sugexp=chrome,mod=12&sourceid=chrome&ie=UTF-8

var options = {
  host: 'www.taobao.com',
  path: '/',
  method: 'GET',
  port: 80,
  agent: keepaliveAgent
};

function get() {
  var start = Date.now();
  var req = http.get(options, function (res) {
    console.log('STATUS1: %d, %d ms', res.statusCode, Date.now() - start);
    console.log('HEADERS1: %j', res.headers);
    res.on('data', function (chunk) {
      console.log('BODY1: %d', chunk.length);
    });
    res.on('end', function () {
      console.log('get end');
    });
  });
  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
}

get();

setTimeout(function () {
  console.log('keep alive sockets:', keepaliveAgent);
  process.exit();
}, 300000);

var count = 0;
setInterval(function() {
  var name = keepaliveAgent.getName(options);
  var sockets = keepaliveAgent.sockets[name] || [];
  var freeSockets = keepaliveAgent.freeSockets[name] || [];
  console.log('%ss, %s, sockets: %d, destroyed: %s, free sockets: %d, destroyed: %s', ++count,
    name, sockets.length, sockets[0] && sockets[0].destroyed,
    freeSockets.length, freeSockets[0] && freeSockets[0].destroyed);
}, 1000);

setInterval(get, 120000);
