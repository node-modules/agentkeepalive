var http = require('http');

http.createServer(function(req, res) {
  req.resume();
  req.on('end', function() {
    res.statusCode = 200;
    res.end(req.method + ' ' + req.url);
  });
}).listen(8080);
