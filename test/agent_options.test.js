'use strict';

const assert = require('assert');
const OriginalAgent = require('http').Agent;
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

      it('should accept read-only inherited keepAlive', () => {
        const defaults = Object.freeze({ keepAlive: false });
        const options = Object.create(defaults);
        const agent = new Agent(options);

        assert.deepStrictEqual(Object.getOwnPropertyNames(options), []);
        assert.deepStrictEqual(defaults, { keepAlive: false });
        assert(agent.keepAlive === false);
        assert(agent.options.timeout === 8000);
        assert(agent.options.freeSocketTimeout === 4000);
      });

      it('should accept read-only inherited durations', () => {
        const defaults = Object.freeze({
          timeout: '15s',
          freeSocketTimeout: '2s',
          socketActiveTTL: '30s',
        });
        const originalDefaults = Object.getOwnPropertyDescriptors(defaults);
        const options = Object.create(defaults);
        const agent = new Agent(options);

        assert.deepStrictEqual(Object.getOwnPropertyNames(options), []);
        assert.deepStrictEqual(Object.getOwnPropertyDescriptors(defaults), originalDefaults);
        assert(agent.options.timeout === 15000);
        assert(agent.options.freeSocketTimeout === 2000);
        assert(agent.options.socketActiveTTL === 30000);
      });

      [ 'keepAliveTimeout', 'freeSocketKeepAliveTimeout' ].forEach(legacyOption => {
        it(`should accept read-only inherited ${legacyOption}`, () => {
          const defaults = Object.freeze({ timeout: '15s', [legacyOption]: '2s' });
          const originalDefaults = Object.getOwnPropertyDescriptors(defaults);
          const options = Object.create(defaults);
          const agent = new Agent(options);

          assert.deepStrictEqual(Object.getOwnPropertyNames(options), []);
          assert.deepStrictEqual(Object.getOwnPropertyDescriptors(defaults), originalDefaults);
          assert(agent.options.timeout === 15000);
          assert(agent.options.freeSocketTimeout === 2000);
          assert(agent.options[legacyOption] === undefined);
        });
      });

      [ 'own', 'inherited' ].forEach(location => {
        it(`should accept non-enumerable ${location} option getters`, () => {
          const defaults = {};
          const values = {
            keepAlive: false,
            timeout: '15s',
            freeSocketTimeout: '2s',
            socketActiveTTL: '30s',
            keepAliveTimeout: '4s',
            freeSocketKeepAliveTimeout: '5s',
          };
          Object.keys(values).forEach(key => {
            Object.defineProperty(defaults, key, { get: () => values[key] });
          });
          const originalDefaults = Object.getOwnPropertyDescriptors(defaults);
          const options = location === 'own' ? defaults : Object.create(defaults);
          const originalOptions = Object.getOwnPropertyDescriptors(options);
          const agent = new Agent(options);

          assert.deepStrictEqual(Object.getOwnPropertyDescriptors(options), originalOptions);
          assert.deepStrictEqual(Object.getOwnPropertyDescriptors(defaults), originalDefaults);
          assert(agent.keepAlive === false);
          assert(agent.options.timeout === 15000);
          assert(agent.options.freeSocketTimeout === 5000);
          assert(agent.options.socketActiveTTL === 30000);
          assert(agent.options.keepAliveTimeout === undefined);
          assert(agent.options.freeSocketKeepAliveTimeout === undefined);
        });
      });

      it('should retain own native options without adding unrelated inherited options', () => {
        const options = Object.create({ maxSockets: 5, customOption: 'inherited' });
        options.maxFreeSockets = 7;
        const agent = new Agent(options);

        assert.deepStrictEqual(Object.keys(options), [ 'maxFreeSockets' ]);
        assert(agent.maxSockets === Infinity);
        assert(agent.maxFreeSockets === 7);
        assert(agent.options.customOption === undefined);
      });

      it('should pass through an own __proto__ option without using it as defaults', () => {
        const options = JSON.parse('{"__proto__":{"keepAlive":false,"timeout":"15s"}}');
        const originalOptions = Object.getOwnPropertyDescriptors(options);
        const nativeAgent = new OriginalAgent(options);
        const agent = new Agent(options);

        assert.deepStrictEqual(Object.getOwnPropertyDescriptors(options), originalOptions);
        assert.deepStrictEqual(Object.getOwnPropertyDescriptor(agent.options, '__proto__'),
          Object.getOwnPropertyDescriptor(nativeAgent.options, '__proto__'));
        assert.deepStrictEqual(Object.getPrototypeOf(agent.options), Object.getPrototypeOf(nativeAgent.options));
        assert(agent.keepAlive === true);
        assert(agent.options.timeout === 8000);
      });

      it('should read own enumerable option getters only once', () => {
        let reads = 0;
        const options = {
          get timeout() {
            reads++;
            return '15s';
          },
        };
        const originalOptions = Object.getOwnPropertyDescriptors(options);
        const agent = new Agent(options);

        assert.deepStrictEqual(Object.getOwnPropertyDescriptors(options), originalOptions);
        assert(reads === 1);
        assert(agent.options.timeout === 15000);
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
