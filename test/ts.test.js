'use strict';

const path = require('path');
const coffee = require('coffee');

describe('test/ts.test.js', () => {
  it('should compile ts and run without error', async () => {
    await coffee.fork(
      require.resolve('typescript/bin/tsc'),
      [ '-p', path.resolve(__dirname, './fixtures/ts/tsconfig.json') ]
    )
      .debug()
      .expect('code', 0)
      .end();

    await coffee.fork(path.resolve(__dirname, './fixtures/ts/index.js'))
      // .debug()
      .expect('code', 0)
      .end();
  });
});
