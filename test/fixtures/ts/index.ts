import * as http from 'http';
import { constants, HttpAgent, HttpsAgent, HttpOptions, HttpsOptions, AgentStatus } from '../../..';
import * as assert from 'assert';

assert(constants.CREATE_ID);
assert(constants.CREATE_HTTPS_CONNECTION);
assert(constants.CURRENT_ID);

const httpOpt: HttpOptions = {
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
};
const keepaliveAgent = new HttpAgent(httpOpt);

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
    const httpAgentStatus: AgentStatus = keepaliveAgent.getCurrentStatus();
    console.log('[%s] agent status changed: %j', Date(), httpAgentStatus);
  }
}, 2000);

// https
const httpsOpt: HttpsOptions = {
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
};
const keepaliveHttpsAgent = new HttpsAgent(httpsOpt);
const httpsAgentStatus: AgentStatus = keepaliveHttpsAgent.getCurrentStatus();
assert(httpsAgentStatus);
