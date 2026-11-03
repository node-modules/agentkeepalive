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

      it('should apply defaults to undefined and null constructor options', () => {
        [ undefined, null ].forEach(options => {
          const agent = new Agent(options);

          assert(agent.keepAlive === true);
          assert(agent.options.timeout === 8000);
          assert(agent.options.freeSocketTimeout === 4000);
          assert(agent.options.socketActiveTTL === 0);
        });
      });

      it('should preserve constructor options with a null prototype', () => {
        const options = Object.assign(Object.create(null), {
          timeout: '15s',
          freeSocketTimeout: '2s',
          socketActiveTTL: '30s',
          keepAlive: false,
        });
        const originalOptions = Object.getOwnPropertyDescriptors(options);
        const agent = new Agent(options);

        assert(Object.getPrototypeOf(options) === null);
        assert.deepStrictEqual(Object.getOwnPropertyDescriptors(options), originalOptions);
        assert(agent.options.timeout === 15000);
        assert(agent.options.freeSocketTimeout === 2000);
        assert(agent.options.socketActiveTTL === 30000);
        assert(agent.keepAlive === false);
      });

      it('should preserve own options overriding read-only inherited options', () => {
        const defaults = Object.freeze({
          timeout: '20s',
          freeSocketTimeout: '5s',
          socketActiveTTL: '60s',
          keepAlive: true,
        });
        const options = Object.create(defaults);
        const values = {
          timeout: '15s',
          freeSocketTimeout: '2s',
          socketActiveTTL: '30s',
          keepAlive: false,
        };
        Object.keys(values).forEach(key => {
          Object.defineProperty(options, key, {
            value: values[key],
            enumerable: true,
            writable: true,
          });
        });
        const originalOptions = Object.getOwnPropertyDescriptors(options);
        const agent = new Agent(options);

        assert(Object.getPrototypeOf(options) === defaults);
        assert.deepStrictEqual(Object.getOwnPropertyDescriptors(options), originalOptions);
        assert(agent.options.timeout === 15000);
        assert(agent.options.freeSocketTimeout === 2000);
        assert(agent.options.socketActiveTTL === 30000);
        assert(agent.keepAlive === false);
      });

      [ true, false ].forEach(enumerable => {
        const visibility = enumerable ? 'enumerable' : 'non-enumerable';

        it(`should preserve ${visibility} inherited constructor options`, () => {
          const defaults = {};
          const values = {
            timeout: '15s',
            freeSocketTimeout: '2s',
            socketActiveTTL: '30s',
            keepAlive: false,
          };
          Object.keys(values).forEach(key => {
            Object.defineProperty(defaults, key, {
              value: values[key],
              enumerable,
              writable: true,
            });
          });
          const originalDefaults = Object.getOwnPropertyDescriptors(defaults);
          const options = Object.create(defaults);
          options.maxSockets = 5;
          const originalOptions = Object.getOwnPropertyDescriptors(options);
          const agent = new Agent(options);

          assert(Object.getPrototypeOf(options) === defaults);
          assert.deepStrictEqual(Object.getOwnPropertyDescriptors(options), originalOptions);
          assert.deepStrictEqual(Object.getOwnPropertyDescriptors(defaults), originalDefaults);
          assert(agent.options.timeout === 15000);
          assert(agent.options.freeSocketTimeout === 2000);
          assert(agent.options.socketActiveTTL === 30000);
          assert(agent.keepAlive === false);
          assert(agent.maxSockets === 5);
        });

        [ 'keepAliveTimeout', 'freeSocketKeepAliveTimeout' ].forEach(legacyOption => {
          it(`should preserve ${visibility} inherited ${legacyOption}`, () => {
            const defaults = { timeout: '15s' };
            Object.defineProperty(defaults, legacyOption, {
              value: '2s',
              enumerable,
              writable: true,
            });
            const originalDefaults = Object.getOwnPropertyDescriptors(defaults);
            const options = Object.create(defaults);
            const agent = new Agent(options);

            assert(Object.getPrototypeOf(options) === defaults);
            assert.deepStrictEqual(Object.getOwnPropertyNames(options), []);
            assert.deepStrictEqual(Object.getOwnPropertyDescriptors(defaults), originalDefaults);
            assert(options[legacyOption] === '2s');
            assert(agent.options.timeout === 15000);
            assert(agent.options.freeSocketTimeout === 2000);
            assert(agent.options[legacyOption] === undefined);
          });
        });
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
