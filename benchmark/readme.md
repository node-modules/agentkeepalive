# Benchmark result

Intel(R) Core(TM)2 Duo CPU     P8600  @ 2.40GHz

node@v0.8.9

50 maxSockets, 60 concurrent, 1000 requests per concurrent, 5ms delay

Keep alive agent (30 seconds):

```js
Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          29.70 secs
Data transferred:        14.88 MB
Response time:            0.03 secs
Transaction rate:      2020.20 trans/sec
Throughput:           0.50 MB/sec
Concurrency:           59.84
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.15
Shortest transaction:         0.01
```

Normal agent:

```js
Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          46.53 secs
Data transferred:        14.88 MB
Response time:            0.05 secs
Transaction rate:      1289.49 trans/sec
Throughput:           0.32 MB/sec
Concurrency:           59.81
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.45
Shortest transaction:         0.00
```

Socket created:

```
[proxy.js:120000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:120000] normal   , 53866 created, 84260 requestFinished, 1.56 req/socket, 0 requests, 0 sockets
{" <10ms":75," <15ms":1112," <20ms":10947," <30ms":32130," <40ms":8228," <50ms":3002," <100ms":4274," <150ms":181," <200ms":18," >=200ms+":33}
```

```bash
$ sh start.sh 
net.inet.ip.portrange.first: 12000 -> 12000
net.inet.tcp.msl: 1000 -> 1000
kern.maxfiles: 1000000 -> 1000000
kern.maxfilesperproc: 1000000 -> 1000000
Intel(R) Core(TM)2 Duo CPU     P8600  @ 2.40GHz
proxy start, listen on 1985
sleep server start, listen on 1984
v0.8.9
50 maxSockets, 60 concurrent, 1000 requests per concurrent, 5ms delay
keep alive
siege -c 60 -r 1000 -b http://localhost:1985/post/k/5
** SIEGE 2.72
** Preparing 60 concurrent users for battle.
The server is now under siege...----------------------------------------------------------------
[proxy.js:1600] keepalive, 50 created, 1600 requestFinished, 32 req/socket, 0 requests, 50 sockets, 8 unusedSockets, 0 timeout
{" <10ms":4," <15ms":334," <20ms":477," <30ms":502," <40ms":121," <50ms":35," <100ms":127," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:1600] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:5629] keepalive, 50 created, 5629 requestFinished, 112.58 req/socket, 0 requests, 50 sockets, 9 unusedSockets, 0 timeout
{" <10ms":46," <15ms":1333," <20ms":1875," <30ms":1790," <40ms":365," <50ms":73," <100ms":147," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:5629] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:9926] keepalive, 50 created, 9926 requestFinished, 198.52 req/socket, 0 requests, 50 sockets, 11 unusedSockets, 0 timeout
{" <10ms":98," <15ms":2718," <20ms":3311," <30ms":3046," <40ms":489," <50ms":96," <100ms":168," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:9926] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:14042] keepalive, 50 created, 14042 requestFinished, 280.84 req/socket, 0 requests, 50 sockets, 1 unusedSockets, 0 timeout
{" <10ms":136," <15ms":3919," <20ms":4787," <30ms":4222," <40ms":652," <50ms":145," <100ms":181," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:14042] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:18233] keepalive, 50 created, 18233 requestFinished, 364.66 req/socket, 0 requests, 50 sockets, 17 unusedSockets, 0 timeout
{" <10ms":173," <15ms":5239," <20ms":6318," <30ms":5401," <40ms":735," <50ms":171," <100ms":196," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:18233] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:22350] keepalive, 50 created, 22350 requestFinished, 447 req/socket, 0 requests, 50 sockets, 6 unusedSockets, 0 timeout
{" <10ms":203," <15ms":6482," <20ms":7665," <30ms":6716," <40ms":859," <50ms":206," <100ms":219," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:22350] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:26373] keepalive, 50 created, 26373 requestFinished, 527.46 req/socket, 0 requests, 50 sockets, 11 unusedSockets, 0 timeout
{" <10ms":221," <15ms":7790," <20ms":9185," <30ms":7631," <40ms":1042," <50ms":249," <100ms":255," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:26373] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:30501] keepalive, 50 created, 30501 requestFinished, 610.02 req/socket, 0 requests, 50 sockets, 15 unusedSockets, 0 timeout
{" <10ms":248," <15ms":9095," <20ms":10715," <30ms":8715," <40ms":1204," <50ms":256," <100ms":268," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:30501] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:33819] keepalive, 50 created, 33819 requestFinished, 676.38 req/socket, 0 requests, 50 sockets, 13 unusedSockets, 0 timeout
{" <10ms":303," <15ms":9768," <20ms":11677," <30ms":9749," <40ms":1571," <50ms":368," <100ms":327," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:33819] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:38097] keepalive, 50 created, 38097 requestFinished, 761.94 req/socket, 0 requests, 50 sockets, 5 unusedSockets, 0 timeout
{" <10ms":355," <15ms":11127," <20ms":13253," <30ms":10940," <40ms":1653," <50ms":386," <100ms":327," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:38097] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:42325] keepalive, 50 created, 42325 requestFinished, 846.5 req/socket, 0 requests, 50 sockets, 10 unusedSockets, 0 timeout
{" <10ms":399," <15ms":12507," <20ms":14682," <30ms":12236," <40ms":1720," <50ms":398," <100ms":327," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:42325] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:46568] keepalive, 50 created, 46568 requestFinished, 931.36 req/socket, 0 requests, 50 sockets, 3 unusedSockets, 0 timeout
{" <10ms":443," <15ms":13947," <20ms":16180," <30ms":13421," <40ms":1780," <50ms":414," <100ms":327," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:46568] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:50666] keepalive, 50 created, 50666 requestFinished, 1013.32 req/socket, 0 requests, 50 sockets, 3 unusedSockets, 0 timeout
{" <10ms":495," <15ms":15152," <20ms":17470," <30ms":14774," <40ms":1924," <50ms":463," <100ms":332," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:50666] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:54801] keepalive, 50 created, 54801 requestFinished, 1096.02 req/socket, 0 requests, 50 sockets, 14 unusedSockets, 0 timeout
{" <10ms":540," <15ms":16484," <20ms":18745," <30ms":16066," <40ms":2059," <50ms":499," <100ms":352," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:54801] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:58861] keepalive, 50 created, 58861 requestFinished, 1177.22 req/socket, 0 requests, 50 sockets, 14 unusedSockets, 0 timeout
{" <10ms":574," <15ms":17515," <20ms":20286," <30ms":17305," <40ms":2217," <50ms":550," <100ms":358," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:58861] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
      done.

Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          29.70 secs
Data transferred:        14.88 MB
Response time:            0.03 secs
Transaction rate:      2020.20 trans/sec
Throughput:           0.50 MB/sec
Concurrency:           59.84
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.15
Shortest transaction:         0.01
 
----------------------------------------------------------------
[proxy.js:60000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:60000] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:60000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:60000] normal   , 0 created, 0 requestFinished, 0 req/socket, 0 requests, 0 sockets
{" <10ms":0," <15ms":0," <20ms":0," <30ms":0," <40ms":0," <50ms":0," <100ms":0," <150ms":0," <200ms":0," >=200ms+":0}
normal
siege -c 60 -r 1000 -b http://localhost:1985/post/5
** SIEGE 2.72
** Preparing 60 concurrent users for battle.
The server is now under siege...----------------------------------------------------------------
[proxy.js:60237] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:60237] normal   , 208 created, 286 requestFinished, 1.38 req/socket, 0 requests, 10 sockets
{" <10ms":1," <15ms":0," <20ms":0," <30ms":23," <40ms":50," <50ms":64," <100ms":79," <150ms":20," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:62788] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:62788] normal   , 2578 created, 3899 requestFinished, 1.51 req/socket, 0 requests, 45 sockets
{" <10ms":1," <15ms":12," <20ms":472," <30ms":1349," <40ms":469," <50ms":239," <100ms":186," <150ms":60," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:65594] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:65594] normal   , 5091 created, 7841 requestFinished, 1.54 req/socket, 0 requests, 33 sockets
{" <10ms":1," <15ms":69," <20ms":1035," <30ms":2967," <40ms":765," <50ms":375," <100ms":322," <150ms":60," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:68371] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:68371] normal   , 7669 created, 11825 requestFinished, 1.54 req/socket, 0 requests, 31 sockets
{" <10ms":4," <15ms":89," <20ms":1538," <30ms":4702," <40ms":1041," <50ms":444," <100ms":493," <150ms":60," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:71027] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:71027] normal   , 9974 created, 15498 requestFinished, 1.55 req/socket, 0 requests, 28 sockets
{" <10ms":7," <15ms":164," <20ms":1955," <30ms":6209," <40ms":1414," <50ms":520," <100ms":686," <150ms":72," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:73665] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:73665] normal   , 12283 created, 19152 requestFinished, 1.56 req/socket, 0 requests, 33 sockets
{" <10ms":9," <15ms":213," <20ms":2383," <30ms":7659," <40ms":1798," <50ms":635," <100ms":883," <150ms":85," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:75652] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:75652] normal   , 14101 created, 21974 requestFinished, 1.56 req/socket, 0 requests, 42 sockets
{" <10ms":9," <15ms":221," <20ms":2527," <30ms":8311," <40ms":2354," <50ms":973," <100ms":1163," <150ms":94," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:78417] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:78417] normal   , 16543 created, 25836 requestFinished, 1.56 req/socket, 0 requests, 36 sockets
{" <10ms":14," <15ms":305," <20ms":2962," <30ms":9801," <40ms":2819," <50ms":1088," <100ms":1334," <150ms":94," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:80952] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:80952] normal   , 18889 created, 29468 requestFinished, 1.56 req/socket, 0 requests, 43 sockets
{" <10ms":14," <15ms":356," <20ms":3517," <30ms":11159," <40ms":3108," <50ms":1157," <100ms":1503," <150ms":120," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:83686] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:83686] normal   , 21300 created, 33301 requestFinished, 1.56 req/socket, 0 requests, 38 sockets
{" <10ms":16," <15ms":420," <20ms":4025," <30ms":12597," <40ms":3512," <50ms":1308," <100ms":1670," <150ms":120," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:86108] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:86108] normal   , 23409 created, 36655 requestFinished, 1.57 req/socket, 0 requests, 22 sockets
{" <10ms":18," <15ms":467," <20ms":4383," <30ms":13764," <40ms":3879," <50ms":1441," <100ms":2016," <150ms":122," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:88868] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:88868] normal   , 25814 created, 40482 requestFinished, 1.57 req/socket, 0 requests, 46 sockets
{" <10ms":19," <15ms":533," <20ms":4902," <30ms":15201," <40ms":4275," <50ms":1587," <100ms":2211," <150ms":122," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:91666] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 50 sockets, 50 unusedSockets, 0 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:91666] normal   , 28381 created, 44473 requestFinished, 1.57 req/socket, 0 requests, 50 sockets
{" <10ms":19," <15ms":554," <20ms":5545," <30ms":16824," <40ms":4529," <50ms":1706," <100ms":2349," <150ms":122," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:94360] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:94360] normal   , 30806 created, 48274 requestFinished, 1.57 req/socket, 0 requests, 38 sockets
{" <10ms":20," <15ms":602," <20ms":6022," <30ms":18432," <40ms":4797," <50ms":1819," <100ms":2528," <150ms":122," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:97025] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:97025] normal   , 33198 created, 52025 requestFinished, 1.57 req/socket, 0 requests, 45 sockets
{" <10ms":20," <15ms":656," <20ms":6538," <30ms":19831," <40ms":5199," <50ms":1936," <100ms":2700," <150ms":127," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:99476] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:99476] normal   , 35422 created, 55496 requestFinished, 1.57 req/socket, 0 requests, 50 sockets
{" <10ms":20," <15ms":691," <20ms":6957," <30ms":20987," <40ms":5591," <50ms":2119," <100ms":2947," <150ms":146," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:102244] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:102244] normal   , 37970 created, 59456 requestFinished, 1.57 req/socket, 0 requests, 39 sockets
{" <10ms":20," <15ms":724," <20ms":7531," <30ms":22621," <40ms":5963," <50ms":2201," <100ms":3008," <150ms":158," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:104983] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:104983] normal   , 40458 created, 63337 requestFinished, 1.57 req/socket, 0 requests, 45 sockets
{" <10ms":23," <15ms":765," <20ms":8094," <30ms":24200," <40ms":6253," <50ms":2323," <100ms":3149," <150ms":158," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:107668] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:107668] normal   , 42842 created, 67108 requestFinished, 1.57 req/socket, 0 requests, 38 sockets
{" <10ms":24," <15ms":819," <20ms":8633," <30ms":25651," <40ms":6577," <50ms":2419," <100ms":3369," <150ms":158," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:110199] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:110199] normal   , 45166 created, 70731 requestFinished, 1.57 req/socket, 0 requests, 47 sockets
{" <10ms":26," <15ms":865," <20ms":9193," <30ms":26962," <40ms":6891," <50ms":2525," <100ms":3546," <150ms":173," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:112975] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:112975] normal   , 47579 created, 74565 requestFinished, 1.57 req/socket, 0 requests, 37 sockets
{" <10ms":26," <15ms":935," <20ms":9745," <30ms":28452," <40ms":7222," <50ms":2639," <100ms":3765," <150ms":173," <200ms":18," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:114637] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:114637] normal   , 48998 created, 76839 requestFinished, 1.57 req/socket, 0 requests, 23 sockets
{" <10ms":26," <15ms":950," <20ms":9898," <30ms":29096," <40ms":7569," <50ms":2829," <100ms":4037," <150ms":181," <200ms":18," >=200ms+":33}
----------------------------------------------------------------
[proxy.js:117458] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:117458] normal   , 51580 created, 80856 requestFinished, 1.57 req/socket, 0 requests, 26 sockets
{" <10ms":27," <15ms":981," <20ms":10458," <30ms":30768," <40ms":7952," <50ms":2941," <100ms":4099," <150ms":181," <200ms":18," >=200ms+":33}
      done.

Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          46.53 secs
Data transferred:        14.88 MB
Response time:            0.05 secs
Transaction rate:      1289.49 trans/sec
Throughput:           0.32 MB/sec
Concurrency:           59.81
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.45
Shortest transaction:         0.00
 
----------------------------------------------------------------
[proxy.js:120000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:120000] normal   , 53866 created, 84260 requestFinished, 1.56 req/socket, 0 requests, 0 sockets
{" <10ms":75," <15ms":1112," <20ms":10947," <30ms":32130," <40ms":8228," <50ms":3002," <100ms":4274," <150ms":181," <200ms":18," >=200ms+":33}
----------------------------------------------------------------
[proxy.js:120000] keepalive, 50 created, 60000 requestFinished, 1200 req/socket, 0 requests, 0 sockets, 0 unusedSockets, 50 timeout
{" <10ms":662," <15ms":17825," <20ms":20552," <30ms":17646," <40ms":2315," <50ms":567," <100ms":377," <150ms":56," <200ms":0," >=200ms+":0}
----------------------------------------------------------------
[proxy.js:120000] normal   , 53866 created, 84260 requestFinished, 1.56 req/socket, 0 requests, 0 sockets
{" <10ms":75," <15ms":1112," <20ms":10947," <30ms":32130," <40ms":8228," <50ms":3002," <100ms":4274," <150ms":181," <200ms":18," >=200ms+":33}
```
