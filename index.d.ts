declare module "agentkeepalive" {
  import * as http from 'http';
  import * as https from 'https';

  export interface AgentStatus {
    createSocketCount: number,
    createSocketErrorCount: number,
    closeSocketCount: number,
    errorSocketCount: number,
    timeoutSocketCount: number,
    requestCount: number,
    freeSockets: object,
    sockets: object,
    requests: object,
  }

  export interface HttpOptions extends http.AgentOptions {
    keepAlive?: boolean;
    freeSocketTimeout?: number;
    freeSocketKeepAliveTimeout?: number;
    timeout?: number;
    socketActiveTTL?: number;
  }

  export interface HttpsOptions extends https.AgentOptions {
    keepAlive?: boolean;
    freeSocketTimeout?: number;
    freeSocketKeepAliveTimeout?: number;
    timeout?: number;
    socketActiveTTL?: number;
  }

  export default class HttpAgent extends http.Agent {
    constructor(opts?: HttpOptions);
    readonly statusChanged: boolean;
    createConnection(options: HttpOptions, connectionListener?: () => void): Socket;
    getCurrentStatus(): AgentStatus;
  }

  export class HttpsAgent extends https.Agent {
    constructor(opts?: HttpsOptions);
    readonly statusChanged: boolean;
    createConnection(options: HttpsOptions, connectionListener?: () => void): Socket;
    getCurrentStatus(): AgentStatus;
  }
}
