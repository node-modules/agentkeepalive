#!/bin/bash 

sudo sysctl -w net.inet.ip.portrange.first=12000
sudo sysctl -w net.inet.tcp.msl=1000
sudo sysctl -w kern.maxfiles=1000000 kern.maxfilesperproc=1000000
sudo ulimit -n 100000

sysctl -n machdep.cpu.brand_string

SERVER=127.0.0.1
NUM=500
CONCURRENT=60
maxSockets=50
DELAY=5
POST=/post

node sleep_server.js &

sleep_server_pid=$!

node proxy.js $maxSockets $SERVER &

sleep 1

node -v
echo "$maxSockets maxSockets, $CONCURRENT concurrent, $NUM requests per concurrent, ${DELAY}ms delay"

echo "keep alive"
echo "siege -c $CONCURRENT -r $NUM -b http://localhost:1985${POST}/k/$DELAY"
siege -c $CONCURRENT -r $NUM -b http://localhost:1985${POST}/k/$DELAY

sleep 5

echo "normal"
echo "siege -c $CONCURRENT -r $NUM -b http://localhost:1985${POST}/$DELAY"
siege -c $CONCURRENT -r $NUM -b http://localhost:1985${POST}/$DELAY

sleep 3

kill $sleep_server_pid
kill %