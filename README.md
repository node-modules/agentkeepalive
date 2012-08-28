agentkeepalive
==============

[![Build Status](https://secure.travis-ci.org/TBEDP/agentkeepalive.png?branch=master)](http://travis-ci.org/TBEDP/agentkeepalive)

The nodejs's missing `keep alive` `http.Agent`.

jscoverage: [**93%**](http://fengmk2.github.com/coverage/agentkeepalive.html)

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

## [Benchmark](https://github.com/TBEDP/agentkeepalive/tree/master/benchmark)

run the benchmark:

```bash
cd benchmark
sh start.sh
```

Intel(R) Core(TM)2 Duo CPU     P8600  @ 2.40GHz

node@v0.8.8

50 maxSockets, 60 concurrent, 1000 requests per concurrent, 5ms delay

Keep alive agent (30 seconds):

```js
Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          31.11 secs
Data transferred:        14.88 MB
Response time:            0.03 secs
Transaction rate:      1928.64 trans/sec
Throughput:           0.48 MB/sec
Concurrency:           59.81
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.23
Shortest transaction:         0.01
```

Normal agent:

```js
Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          45.70 secs
Data transferred:        14.88 MB
Response time:            0.05 secs
Transaction rate:      1312.91 trans/sec
Throughput:           0.33 MB/sec
Concurrency:           59.79
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.15
Shortest transaction:         0.01
```

Socket created:

```
[proxy.js:120000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 
0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798,
" <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:120000] normal   , 53705 created, 84228 requestFinished, 1.57 req/socket, 
0 requests, 0 sockets
{" <10ms":54," <15ms":862," <20ms":8830," <30ms":36242," <40ms":7970," <50ms":2359,
" <100ms":3645," <150ms":38," <200ms":0," >=200ms+":0}
```

# Authors

Below is the output from `git-summary`.

```
 project: agentkeepalive
 commits: 10
 active : 3 days
 files  : 13
 authors: 
    10  fengmk2                 100.0%
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