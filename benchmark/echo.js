'use strict';

const Agent = require('../');

const agent = new Agent({
  keepAlive: true,
  maxSockets: 2,
  maxFreeSockets: 2,
  keepAliveMsecs: 30000,
});

const options = {
  host: '10.125.196.152',
  port: 1984,
  path: '/1',
  method: 'GET',
};

function get() {
  agent.get(options, res => {
    let size = 0;
    res.on('data', c => {
      size += c.length;
    }).on('end', () => {
      console.log('got %d bytes', size);
    });
  }).on('error', err => {
    console.log('got error: %s', err);
  });
}

setInterval(() => {
  get();
  get();
}, 1000);
get();


function showAgentDetail() {
  const peddingRequests = {};
  for (const k in agent.requests) {
    const reqs = agent.requests[k];
    peddingRequests[k] = reqs && reqs.length || 0;
  }
  const totalSockets = {};
  for (const k in agent.sockets) {
    const socks = agent.sockets[k];
    totalSockets[k] = socks && socks.length || 0;
  }
  const freeSockets = {};
  for (const k in agent.freeSockets) {
    const socks = agent.freeSockets[k];
    freeSockets[k] = socks && socks.length || 0;
  }

  const requestPerSocket = agent.createSocketCount && agent.requestFinishedCount / agent.createSocketCount;
  console.log('[%s] [worker:%d] Agent(%s,%sms,%s,%s): requests: %d, created: %d, timeout: %d, reqs/socket: %s, pedding requests: %j, alive sockets: %j, free sockets: %j',
    Date(), process.pid,
    agent.keepAlive && agent.options.keepAlive, agent.keepAliveMsecs,
    agent.maxSockets, agent.maxFreeSockets,
    agent.requestFinishedCount, agent.createSocketCount, agent.timeoutSocketCount,
    requestPerSocket.toFixed(0),
    peddingRequests, totalSockets, freeSockets
  );
}

setInterval(showAgentDetail, 3000);
