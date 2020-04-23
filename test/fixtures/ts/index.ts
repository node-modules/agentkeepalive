import http from 'http';
import Agent from '../../..';
import assert from 'assert';

const constants = Agent.constants;
assert(constants.CREATE_ID);
assert(constants.CREATE_HTTPS_CONNECTION);
assert(constants.CURRENT_ID);

const httpOpt: Agent.HttpOptions = {
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
};
const keepaliveAgent = new Agent(httpOpt);

const options = {
  host: 'cnodejs.org',
  port: 80,
  path: '/',
  method: 'GET',
  agent: keepaliveAgent,
};

const req = http.request(options, res => {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', e => {
  console.log('problem with request: ' + e.message);
});

req.end();

setTimeout(() => {
  if (keepaliveAgent.statusChanged) {
    const httpAgentStatus: Agent.AgentStatus = keepaliveAgent.getCurrentStatus();
    console.log('[%s] agent status changed: %j', Date(), httpAgentStatus);
  }
}, 2000);

// https
const HttpsAgent = Agent.HttpsAgent;
const httpsOpt: Agent.HttpsOptions = {
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
};
const keepaliveHttpsAgent = new HttpsAgent(httpsOpt);
const httpsAgentStatus: Agent.AgentStatus = keepaliveHttpsAgent.getCurrentStatus();
assert(httpsAgentStatus);
