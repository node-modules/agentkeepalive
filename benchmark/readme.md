# Benchmark result

100 maxSockets, 120 concurrent, 1000 requests per concurrent, 5ms delay

Keep alive agent (30 seconds):

```js
Transactions:         120000 hits
Availability:         100.00 %
Elapsed time:          53.86 secs
Data transferred:         8.58 MB
Response time:            0.05 secs
Transaction rate:      2228.00 trans/sec
Throughput:           0.16 MB/sec
Concurrency:          119.75
Successful transactions:      120000
Failed transactions:             0
Longest transaction:          0.23
Shortest transaction:         0.02
```

Normal agent:

```js
Transactions:         120000 hits
Availability:         100.00 %
Elapsed time:          99.68 secs
Data transferred:         8.58 MB
Response time:            0.10 secs
Transaction rate:      1203.85 trans/sec
Throughput:           0.09 MB/sec
Concurrency:          119.29
Successful transactions:      120000
Failed transactions:             0
Longest transaction:          0.30
Shortest transaction:         0.00
```

Socket created:

```
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 114412 created, 0 requests, 0 sockets
```

```bash
$ sh start.sh 
net.inet.ip.portrange.first: 12000 -> 12000
net.inet.tcp.msl: 1000 -> 1000
kern.maxfiles: 1000000 -> 1000000
kern.maxfilesperproc: 1000000 -> 1000000
proxy start, listen on 1985
sleep server start, listen on 1984
100 maxSockets, 120 concurrent, 1000 requests per concurrent, 5ms delay
keep alive
** SIEGE 2.72
** Preparing 120 concurrent users for battle.
The server is now under siege...[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 0 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 0 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 9 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 38 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 12 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 12 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 12 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 42 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 16 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 29 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 35 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 0 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 34 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 22 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 14 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 33 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 3 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 6 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 31 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 11 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 26 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 36 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 31 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 27 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 42 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 8 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 28 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
      done.

Transactions:         120000 hits
Availability:         100.00 %
Elapsed time:          53.86 secs
Data transferred:         8.58 MB
Response time:            0.05 secs
Transaction rate:      2228.00 trans/sec
Throughput:           0.16 MB/sec
Concurrency:          119.75
Successful transactions:      120000
Failed transactions:             0
Longest transaction:          0.23
Shortest transaction:         0.02
 
normal
** SIEGE 2.72
** Preparing 120 concurrent users for battle.
The server is now under siege...[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 1441 created, 0 requests, 94 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 3860 created, 0 requests, 88 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 6257 created, 0 requests, 80 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 8708 created, 0 requests, 81 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 11135 created, 0 requests, 77 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 13383 created, 0 requests, 93 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 15776 created, 0 requests, 80 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 18080 created, 0 requests, 96 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 20477 created, 0 requests, 84 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 22399 created, 0 requests, 87 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 24805 created, 0 requests, 87 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 26381 created, 0 requests, 89 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 28587 created, 0 requests, 89 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 30998 created, 0 requests, 94 sockets
[proxy.js] keepalive, 100 created, 0 requests, 100 sockets, 100 unusedSockets
[proxy.js] normal   , 33446 created, 0 requests, 88 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 35727 created, 0 requests, 80 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 38177 created, 0 requests, 78 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 40595 created, 0 requests, 96 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 43014 created, 0 requests, 84 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 45465 created, 0 requests, 82 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 47886 created, 0 requests, 83 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 50235 created, 0 requests, 100 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 52586 created, 0 requests, 98 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 55069 created, 0 requests, 92 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 57264 created, 1 requests, 100 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 59653 created, 0 requests, 94 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 61606 created, 0 requests, 78 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 63986 created, 0 requests, 83 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 66442 created, 0 requests, 81 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 68772 created, 0 requests, 96 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 71162 created, 0 requests, 77 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 73562 created, 0 requests, 94 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 75945 created, 0 requests, 86 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 78277 created, 0 requests, 96 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 80061 created, 0 requests, 94 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 82582 created, 0 requests, 92 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 84349 created, 0 requests, 78 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 86677 created, 0 requests, 84 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 89091 created, 0 requests, 92 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 91534 created, 0 requests, 84 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 93800 created, 0 requests, 89 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 95990 created, 0 requests, 93 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 98314 created, 0 requests, 83 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 100786 created, 0 requests, 95 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 102657 created, 0 requests, 93 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 105173 created, 0 requests, 79 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 107631 created, 0 requests, 87 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 110043 created, 0 requests, 76 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 112468 created, 0 requests, 87 sockets
      done.

Transactions:         120000 hits
Availability:         100.00 %
Elapsed time:          99.68 secs
Data transferred:         8.58 MB
Response time:            0.10 secs
Transaction rate:      1203.85 trans/sec
Throughput:           0.09 MB/sec
Concurrency:          119.29
Successful transactions:      120000
Failed transactions:             0
Longest transaction:          0.30
Shortest transaction:         0.00
 
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 114412 created, 0 requests, 0 sockets
[proxy.js] keepalive, 100 created, 0 requests, 0 sockets, 0 unusedSockets
[proxy.js] normal   , 114412 created, 0 requests, 0 sockets
```