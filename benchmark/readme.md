# Benchmark result

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

```bash
$ sh start.sh 
net.inet.ip.portrange.first: 12000 -> 12000
net.inet.tcp.msl: 1000 -> 1000
kern.maxfiles: 1000000 -> 1000000
kern.maxfilesperproc: 1000000 -> 1000000
Intel(R) Core(TM)2 Duo CPU     P8600  @ 2.40GHz
sleep server start, listen on 1984
proxy start, listen on 1985
v0.8.8
50 maxSockets, 60 concurrent, 1000 requests per concurrent, 5ms delay
keep alive
siege -c 60 -r 1000 -b http://localhost:1985/post/k/5
** SIEGE 2.72
** Preparing 60 concurrent users for battle.
The server is now under siege...----------------------------------------------------------------
[proxy.js:1596] keepalive, 50 created, 1596 requestFinished, 31.92 req/socket, 0 requests, 50 sockets, 6 unusedSockets, 0 timeout
{" <10ms":5," <15ms":212," <20ms":478," <30ms":596," <40ms":184," <50ms":41," <100ms":72," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:1596] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:5591] keepalive, 50 created, 5591 requestFinished, 111.82 req/socket, 0 requests, 50 sockets, 18 unusedSockets, 0 timeout
{" <10ms":24," <15ms":1282," <20ms":1985," <30ms":1808," <40ms":312," <50ms":83," <100ms":89," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:5591] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:9700] keepalive, 50 created, 9700 requestFinished, 194 req/socket, 0 requests, 50 sockets, 9 unusedSockets, 0 timeout
{" <10ms":74," <15ms":2240," <20ms":3386," <30ms":3323," <40ms":437," <50ms":104," <100ms":128," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:9700] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:13674] keepalive, 50 created, 13674 requestFinished, 273.48 req/socket, 0 requests, 50 sockets, 10 unusedSockets, 0 timeout
{" <10ms":97," <15ms":3085," <20ms":4749," <30ms":4856," <40ms":613," <50ms":137," <100ms":129," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:13674] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:17677] keepalive, 50 created, 17677 requestFinished, 353.54 req/socket, 0 requests, 50 sockets, 9 unusedSockets, 0 timeout
{" <10ms":106," <15ms":4180," <20ms":6304," <30ms":6052," <40ms":731," <50ms":162," <100ms":134," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:17677] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:21708] keepalive, 50 created, 21708 requestFinished, 434.16 req/socket, 0 requests, 50 sockets, 28 unusedSockets, 0 timeout
{" <10ms":144," <15ms":5086," <20ms":7653," <30ms":7561," <40ms":895," <50ms":213," <100ms":148," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:21708] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:25637] keepalive, 50 created, 25637 requestFinished, 512.74 req/socket, 0 requests, 50 sockets, 1 unusedSockets, 0 timeout
{" <10ms":183," <15ms":5975," <20ms":8950," <30ms":9014," <40ms":1091," <50ms":246," <100ms":170," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:25637] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:29646] keepalive, 50 created, 29646 requestFinished, 592.92 req/socket, 0 requests, 50 sockets, 2 unusedSockets, 0 timeout
{" <10ms":202," <15ms":7039," <20ms":10452," <30ms":10326," <40ms":1160," <50ms":289," <100ms":170," <150ms":8," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:29646] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:32913] keepalive, 50 created, 32913 requestFinished, 658.26 req/socket, 0 requests, 50 sockets, 3 unusedSockets, 0 timeout
{" <10ms":221," <15ms":7662," <20ms":11323," <30ms":11470," <40ms":1522," <50ms":404," <100ms":257," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:32913] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:36328] keepalive, 50 created, 36328 requestFinished, 726.56 req/socket, 1 requests, 50 sockets, 0 unusedSockets, 0 timeout
{" <10ms":236," <15ms":8331," <20ms":12362," <30ms":12538," <40ms":1898," <50ms":573," <100ms":336," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:36328] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:39878] keepalive, 50 created, 39878 requestFinished, 797.56 req/socket, 0 requests, 50 sockets, 7 unusedSockets, 0 timeout
{" <10ms":252," <15ms":9178," <20ms":13557," <30ms":13493," <40ms":2115," <50ms":753," <100ms":476," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:39878] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:43938] keepalive, 50 created, 43938 requestFinished, 878.76 req/socket, 0 requests, 50 sockets, 13 unusedSockets, 0 timeout
{" <10ms":273," <15ms":10208," <20ms":15142," <30ms":14783," <40ms":2236," <50ms":765," <100ms":477," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:43938] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:48019] keepalive, 50 created, 48019 requestFinished, 960.38 req/socket, 0 requests, 50 sockets, 12 unusedSockets, 0 timeout
{" <10ms":305," <15ms":11134," <20ms":16580," <30ms":16288," <40ms":2414," <50ms":767," <100ms":477," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:48019] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:52008] keepalive, 50 created, 52008 requestFinished, 1040.16 req/socket, 0 requests, 50 sockets, 5 unusedSockets, 0 timeout
{" <10ms":325," <15ms":12223," <20ms":18083," <30ms":17500," <40ms":2551," <50ms":793," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:52008] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:55989] keepalive, 50 created, 55989 requestFinished, 1119.78 req/socket, 0 requests, 50 sockets, 14 unusedSockets, 0 timeout
{" <10ms":348," <15ms":13142," <20ms":19494," <30ms":18926," <40ms":2748," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:55989] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:60000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:60000] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
      done.

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
 
----------------------------------------------------------------
[proxy.js:60000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:60000] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:60000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:60000] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
normal
siege -c 60 -r 1000 -b http://localhost:1985/post/5
** SIEGE 2.72
** Preparing 60 concurrent users for battle.
The server is now under siege...----------------------------------------------------------------
[proxy.js:61269] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:61269] normal   , 1144 created, 1717 requestFinished, 1.5 req/socket, 0 requests, 29 sockets
{" <10ms":13," <15ms":34," <20ms":137," <30ms":756," <40ms":202," <50ms":78," <100ms":49," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:64051] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:64051] normal   , 3644 created, 5644 requestFinished, 1.55 req/socket, 0 requests, 24 sockets
{" <10ms":13," <15ms":72," <20ms":463," <30ms":2673," <40ms":571," <50ms":155," <100ms":104," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:66706] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:66706] normal   , 6046 created, 9394 requestFinished, 1.55 req/socket, 0 requests, 45 sockets
{" <10ms":13," <15ms":104," <20ms":874," <30ms":4299," <40ms":916," <50ms":229," <100ms":271," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:69315] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:69315] normal   , 8398 created, 13085 requestFinished, 1.56 req/socket, 0 requests, 39 sockets
{" <10ms":13," <15ms":140," <20ms":1276," <30ms":5866," <40ms":1228," <50ms":368," <100ms":424," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:71987] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:71987] normal   , 10696 created, 16796 requestFinished, 1.57 req/socket, 0 requests, 31 sockets
{" <10ms":15," <15ms":203," <20ms":1713," <30ms":7285," <40ms":1697," <50ms":467," <100ms":607," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:74658] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:74658] normal   , 13070 created, 20540 requestFinished, 1.57 req/socket, 0 requests, 32 sockets
{" <10ms":16," <15ms":253," <20ms":2142," <30ms":8863," <40ms":2084," <50ms":567," <100ms":733," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:77328] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:77328] normal   , 15458 created, 24255 requestFinished, 1.57 req/socket, 0 requests, 39 sockets
{" <10ms":19," <15ms":298," <20ms":2477," <30ms":10639," <40ms":2330," <50ms":672," <100ms":890," <150ms":3," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:79965] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:79965] normal   , 17859 created, 28011 requestFinished, 1.57 req/socket, 0 requests, 35 sockets
{" <10ms":19," <15ms":319," <20ms":2892," <30ms":12369," <40ms":2557," <50ms":755," <100ms":1041," <150ms":13," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:82398] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:82398] normal   , 20046 created, 31440 requestFinished, 1.57 req/socket, 0 requests, 31 sockets
{" <10ms":19," <15ms":349," <20ms":3193," <30ms":13859," <40ms":2836," <50ms":900," <100ms":1204," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:85033] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:85033] normal   , 22439 created, 35159 requestFinished, 1.57 req/socket, 0 requests, 44 sockets
{" <10ms":19," <15ms":371," <20ms":3529," <30ms":15602," <40ms":3167," <50ms":1007," <100ms":1300," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:87730] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:87730] normal   , 24940 created, 39033 requestFinished, 1.57 req/socket, 0 requests, 41 sockets
{" <10ms":19," <15ms":385," <20ms":3913," <30ms":17409," <40ms":3381," <50ms":1094," <100ms":1491," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:90395] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:90395] normal   , 27315 created, 42794 requestFinished, 1.57 req/socket, 0 requests, 34 sockets
{" <10ms":19," <15ms":429," <20ms":4285," <30ms":19026," <40ms":3744," <50ms":1199," <100ms":1655," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:93101] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:93101] normal   , 29678 created, 46577 requestFinished, 1.57 req/socket, 0 requests, 19 sockets
{" <10ms":21," <15ms":480," <20ms":4689," <30ms":20571," <40ms":4138," <50ms":1321," <100ms":1843," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:95766] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:95766] normal   , 32106 created, 50352 requestFinished, 1.57 req/socket, 2 requests, 50 sockets
{" <10ms":25," <15ms":510," <20ms":5143," <30ms":22241," <40ms":4402," <50ms":1382," <100ms":2025," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:98457] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:98457] normal   , 34372 created, 54010 requestFinished, 1.57 req/socket, 0 requests, 37 sockets
{" <10ms":26," <15ms":549," <20ms":5539," <30ms":23718," <40ms":4894," <50ms":1479," <100ms":2214," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:100741] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:100741] normal   , 36454 created, 57259 requestFinished, 1.57 req/socket, 0 requests, 34 sockets
{" <10ms":26," <15ms":570," <20ms":5806," <30ms":24817," <40ms":5386," <50ms":1621," <100ms":2477," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:103169] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:103169] normal   , 38643 created, 60672 requestFinished, 1.57 req/socket, 0 requests, 46 sockets
{" <10ms":30," <15ms":583," <20ms":6087," <30ms":26107," <40ms":5816," <50ms":1824," <100ms":2684," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:105896] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:105896] normal   , 41054 created, 64494 requestFinished, 1.57 req/socket, 0 requests, 42 sockets
{" <10ms":30," <15ms":625," <20ms":6486," <30ms":27884," <40ms":6100," <50ms":1911," <100ms":2822," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:108483] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:108483] normal   , 43371 created, 68135 requestFinished, 1.57 req/socket, 0 requests, 41 sockets
{" <10ms":31," <15ms":663," <20ms":6890," <30ms":29455," <40ms":6389," <50ms":1997," <100ms":3020," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:111191] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:111191] normal   , 45790 created, 71947 requestFinished, 1.57 req/socket, 0 requests, 26 sockets
{" <10ms":32," <15ms":705," <20ms":7327," <30ms":31095," <40ms":6751," <50ms":2059," <100ms":3184," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:113856] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:113856] normal   , 48123 created, 75625 requestFinished, 1.57 req/socket, 0 requests, 50 sockets
{" <10ms":32," <15ms":765," <20ms":7742," <30ms":32520," <40ms":7253," <50ms":2188," <100ms":3318," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:116611] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:116611] normal   , 50550 created, 79464 requestFinished, 1.57 req/socket, 0 requests, 49 sockets
{" <10ms":32," <15ms":793," <20ms":8192," <30ms":34137," <40ms":7664," <50ms":2306," <100ms":3449," <150ms":38," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:119315] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:119315] normal   , 53085 created, 83370 requestFinished, 1.57 req/socket, 0 requests, 43 sockets
{" <10ms":32," <15ms":802," <20ms":8646," <30ms":35900," <40ms":7931," <50ms":2354," <100ms":3612," <150ms":38," <200ms":0," >=200ms+":0}
      done.

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
 
----------------------------------------------------------------
[proxy.js:120000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":424," <15ms":14124," <20ms":20911," <30ms":20330," <40ms":2880," <50ms":798," <100ms":479," <150ms":40," <200ms":11," >=200ms+":3}
----------------------------------------------------------------
[proxy.js:120000] normal   , 53705 created, 84228 requestFinished, 1.57 req/socket, 0 requests, 0 sockets
{" <10ms":54," <15ms":862," <20ms":8830," <30ms":36242," <40ms":7970," <50ms":2359," <100ms":3645," <150ms":38," <200ms":0," >=200ms+":0}
```