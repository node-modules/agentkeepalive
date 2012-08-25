# Benchmark result

50 maxSockets, 60 concurrent, 1000 requests per concurrent, 5ms delay

Keep alive agent:

```
Transaction rate:      2214.02 trans/sec
```

Normal agent:

```
Transaction rate:      1138.30 trans/sec
```

Socket created:

```
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 52555 created, 0 requests, 0 sockets
```

```bash
$ sh start.sh

net.inet.ip.portrange.first: 12000 -> 12000
net.inet.tcp.msl: 1000 -> 1000
kern.maxfiles: 1000000 -> 1000000
kern.maxfilesperproc: 1000000 -> 1000000
start.sh: line 6: ulimit: open files: cannot modify limit: Operation not permitted
proxy start, listen on 1985
sleep server start, listen on 1984
50 maxSockets, 60 concurrent, 1000 requests per concurrent, 5ms delay
keep alive
** SIEGE 2.72
** Preparing 60 concurrent users for battle.
The server is now under siege...[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 3 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 8 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 0 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 4 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 13 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 6 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 3 requests, 50 sockets, 0 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 16 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 8 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 6 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 23 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 7 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 22 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 45 unusedSockets
[proxy.js] normal   , 0 created, 0 requests, 0 sockets
      done.

Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          27.10 secs
Data transferred:         4.29 MB
Response time:            0.03 secs
Transaction rate:      2214.02 trans/sec
Throughput:           0.16 MB/sec
Concurrency:           59.79
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.14
Shortest transaction:         0.01
 
normal
** SIEGE 2.72
** Preparing 60 concurrent users for battle.
The server is now under siege...[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 2141 created, 0 requests, 45 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 4211 created, 0 requests, 42 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 6250 created, 0 requests, 42 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 8459 created, 6 requests, 50 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 10608 created, 0 requests, 42 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 12743 created, 0 requests, 37 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 14899 created, 0 requests, 50 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 16737 created, 0 requests, 43 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 18895 created, 0 requests, 47 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 20516 created, 0 requests, 44 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 22687 created, 0 requests, 49 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 24769 created, 0 requests, 47 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 26778 created, 0 requests, 35 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 28871 created, 0 requests, 42 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 30793 created, 0 requests, 46 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 32944 created, 0 requests, 42 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 35053 created, 0 requests, 42 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 37111 created, 0 requests, 37 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 38800 created, 0 requests, 32 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 40887 created, 0 requests, 46 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 42722 created, 0 requests, 38 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 44377 created, 0 requests, 50 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 46551 created, 0 requests, 47 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 48217 created, 0 requests, 45 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 50503 created, 0 requests, 49 sockets
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 52054 created, 0 requests, 20 sockets
      done.

Transactions:          60000 hits
Availability:         100.00 %
Elapsed time:          52.71 secs
Data transferred:         4.29 MB
Response time:            0.05 secs
Transaction rate:      1138.30 trans/sec
Throughput:           0.08 MB/sec
Concurrency:           59.67
Successful transactions:       60000
Failed transactions:             0
Longest transaction:          0.20
Shortest transaction:         0.01
 
[proxy.js] keepalive, 50 created, 0 requests, 50 sockets, 50 unusedSockets
[proxy.js] normal   , 52555 created, 0 requests, 0 sockets
```