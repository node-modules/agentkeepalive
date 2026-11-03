'use strict';

const assert = require('assert');
const { HttpAgent, HttpsAgent } = require('..');

describe('test/agent_options.test.js', () => {
  [ HttpAgent, HttpsAgent ].forEach(Agent => {
    describe(Agent.name, () => {
      it('should preserve constructor options while normalizing durations', () => {
        const options = {
          timeout: '10s',
          freeSocketTimeout: '2s',
          socketActiveTTL: '30s',
          maxSockets: 5,
        };
        const originalOptions = Object.assign({}, options);
        const agent = new Agent(options);

        assert.deepStrictEqual(options, originalOptions);
        assert(agent.options.timeout === 10000);
        assert(agent.options.freeSocketTimeout === 2000);
        assert(agent.options.socketActiveTTL === 30000);
        assert(agent.keepAlive === true);
        assert(agent.maxSockets === 5);
      });

      it('should accept frozen constructor options and apply defaults', () => {
        const options = Object.freeze({
          keepAlive: false,
          timeout: 1000,
        });
        const agent = new Agent(options);

        assert.deepStrictEqual(options, { keepAlive: false, timeout: 1000 });
        assert(agent.keepAlive === false);
        assert(agent.options.timeout === 1000);
        assert(agent.options.freeSocketTimeout === 4000);
        assert(agent.options.socketActiveTTL === 0);
      });

      [ 'keepAliveTimeout', 'freeSocketKeepAliveTimeout' ].forEach(legacyOption => {
        it(`should preserve the legacy ${legacyOption} constructor option`, () => {
          const options = {
            timeout: '10s',
            [legacyOption]: '2s',
          };
          const originalOptions = Object.assign({}, options);
          const agent = new Agent(options);

          assert.deepStrictEqual(options, originalOptions);
          assert(agent.options.timeout === 10000);
          assert(agent.options.freeSocketTimeout === 2000);
          assert(agent.options[legacyOption] === undefined);
        });
      });
    });
  });
});
