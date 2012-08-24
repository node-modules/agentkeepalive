agentkeepalive
==============

[![Build Status](https://secure.travis-ci.org/TBEDP/agentkeepalive.png?branch=master)](http://travis-ci.org/TBEDP/agentkeepalive)

The nodejs's missing `keep alive` `http.Agent`.

jscoverage: [**100%**](http://fengmk2.github.com/coverage/agentkeepalive.html)

## Install

```bash
$ npm install agentkeepalive
```

## Usage

```js
var http = require('http');
var Agent = require('agentkeepalive');

var keepaliveAgent = new Agent({
  maxSockets: 10,
  maxKeepAliveTime: 30000 // keepalive for 30 seconds
});

var options = {
  host: 'cnodejs.org',
  port: 80,
  path: '/',
  method: 'GET',
  agent: keepaliveAgent
};

var req = http.request(options, function (res) {
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
}, 2000);

```

## License 

(The MIT License)

Copyright (c) 2012 fengmk2 <fengmk2@gmail.com>;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.