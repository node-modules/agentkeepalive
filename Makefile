TESTS =
TIMEOUT = 5000
REPORTER = spec
MOCHAOPTS=

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TIMEOUT) $(MOCHAOPTS) $(TESTS)

test-cov: lib-cov
	@AGENT_KEEPALIVE_COV=1 $(MAKE) test
	@AGENT_KEEPALIVE_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@rm -rf lib-cov
	@jscoverage lib lib-cov

clean:
	@rm -rf lib-cov
	@rm -f coverage.html

.PHONY: test test-cov lib-cov clean
